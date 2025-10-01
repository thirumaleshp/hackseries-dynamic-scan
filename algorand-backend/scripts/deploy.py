"""Utility script for compiling and optionally deploying the DynaQR contract.

Usage:
    python scripts/deploy.py        # compile TEAL artifacts (default)
    python scripts/deploy.py --deploy  # compile and deploy if env vars are set

Set the following environment variables (or create a .env file in the
algorand-backend directory) to enable deployment:

    ALGOD_SERVER=https://testnet-api.algonode.cloud
    ALGOD_TOKEN=
    ALGOD_PORT=
    DEPLOYER_MNEMONIC="word word ..."

The script is designed for hackathon demos: it validates configuration,
generates the TEAL artifacts consumed by the front-end, and can optionally
submit the contract to the configured network.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional

from algosdk import account, mnemonic
from algosdk.transaction import (
    ApplicationCreateTxn,
    OnComplete,
    StateSchema,
    wait_for_confirmation,
)
from algosdk.v2client import algod
from dotenv import load_dotenv
from pyteal import Mode, compileTeal


BASE_DIR = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = BASE_DIR / "artifacts"

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from contracts.dynaqr_contract import clear_state_program, dynamic_qr_contract


def write_artifacts() -> dict[str, str]:
    """Compile approval & clear programs and persist TEAL files."""

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    approval_source = compileTeal(
        dynamic_qr_contract(),
        mode=Mode.Application,
        version=8,
    )

    clear_source = compileTeal(
        clear_state_program(),
        mode=Mode.Application,
        version=8,
    )

    (ARTIFACT_DIR / "approval.teal").write_text(approval_source, encoding="utf-8")
    (ARTIFACT_DIR / "clear.teal").write_text(clear_source, encoding="utf-8")

    summary = {
        "approval": str((ARTIFACT_DIR / "approval.teal").resolve()),
        "clear": str((ARTIFACT_DIR / "clear.teal").resolve()),
    }

    (ARTIFACT_DIR / "manifest.json").write_text(json.dumps(summary, indent=2))
    return summary


def build_algod_client() -> Optional[algod.AlgodClient]:
    server = os.getenv("ALGOD_SERVER")
    token = os.getenv("ALGOD_TOKEN")
    port = os.getenv("ALGOD_PORT", "")

    if not server:
        return None

    return algod.AlgodClient(token, server, port)


def deploy_application(client: algod.AlgodClient) -> tuple[int, str]:
    approval = compileTeal(dynamic_qr_contract(), Mode.Application, version=8)
    clear = compileTeal(clear_state_program(), Mode.Application, version=8)

    compiled_approval = client.compile(approval)
    compiled_clear = client.compile(clear)

    approval_bytes = bytes.fromhex(compiled_approval["result"])
    clear_bytes = bytes.fromhex(compiled_clear["result"])

    creator_mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    if not creator_mnemonic:
        raise RuntimeError("DEPLOYER_MNEMONIC is required to deploy the contract")

    private_key = mnemonic.to_private_key(creator_mnemonic)
    creator_address = account.address_from_private_key(private_key)

    params = client.suggested_params()

    global_schema = StateSchema(num_uints=4, num_byte_slices=0)
    local_schema = StateSchema(num_uints=5, num_byte_slices=0)

    txn = ApplicationCreateTxn(
        sender=creator_address,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_bytes,
        clear_program=clear_bytes,
        global_schema=global_schema,
        local_schema=local_schema,
    )

    signed_txn = txn.sign(private_key)
    tx_id = client.send_transaction(signed_txn)

    result = wait_for_confirmation(client, tx_id, 4)
    app_id = result.get("application-index")
    if not app_id:
        raise RuntimeError("Unable to fetch application ID from confirmation")

    print(f"✅ Contract deployed: Application ID {app_id}")
    return app_id, creator_address


def main() -> None:
    parser = argparse.ArgumentParser(description="Compile and deploy DynaQR contract")
    parser.add_argument("--deploy", action="store_true", help="Deploy to configured network")
    args = parser.parse_args()

    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(BASE_DIR.parent / ".env", override=False)

    summary = write_artifacts()
    print("🧾 TEAL artifacts generated:")
    for key, value in summary.items():
        print(f"  - {key}: {value}")

    if not args.deploy:
        return

    client = build_algod_client()
    if not client:
        raise RuntimeError(
            "ALGOD_SERVER (and related vars) must be set to deploy the contract"
        )

    app_id, deployer_address = deploy_application(client)
    output = {
        "app_id": app_id,
        "deployer": deployer_address,
    }
    (ARTIFACT_DIR / "deployment.json").write_text(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
