"""PyTeal implementation of the DynaQR event platform contract."""

from __future__ import annotations

from typing import Final

from pyteal import (
    And,
    App,
    Assert,
    Btoi,
    Bytes,
    Cond,
    Concat,
    Expr,
    Global,
    Int,
    OnComplete,
    Or,
    Return,
    Seq,
    Txn,
)


# Contract method names -------------------------------------------------------------

CREATE_EVENT: Final = Bytes("create_event")
UPDATE_URL: Final = Bytes("update_url")
REGISTER_EVENT: Final = Bytes("register_event")
CONFIRM_ATTENDANCE: Final = Bytes("confirm_attendance")
MINT_NFT: Final = Bytes("mint_nft")
DEACTIVATE_EVENT: Final = Bytes("deactivate_event")
INCREMENT_SCAN: Final = Bytes("increment_scan")
UPDATE_TICKET_PRICE: Final = Bytes("update_ticket_price")
REFUND_REGISTRATION: Final = Bytes("refund_registration")


# Global aggregate keys -------------------------------------------------------------

EVENT_COUNT_KEY: Final = Bytes("event_count")
VERSION_KEY: Final = Bytes("contract_version")
TOTAL_REGISTRATIONS_KEY: Final = Bytes("total_registrations")
TOTAL_REVENUE_KEY: Final = Bytes("total_revenue")


# Event-specific suffixes -----------------------------------------------------------

EVENT_NAME_KEY: Final = Bytes("event_name")
CURRENT_URL_KEY: Final = Bytes("current_url")
ACCESS_TYPE_KEY: Final = Bytes("access_type")
EXPIRY_DATE_KEY: Final = Bytes("expiry_date")
CREATED_AT_KEY: Final = Bytes("created_at")
OWNER_KEY: Final = Bytes("owner")
SCAN_COUNT_KEY: Final = Bytes("scan_count")
ACTIVE_KEY: Final = Bytes("active")
TICKET_PRICE_KEY: Final = Bytes("ticket_price")
MAX_CAPACITY_KEY: Final = Bytes("max_capacity")
REGISTERED_COUNT_KEY: Final = Bytes("registered_count")
NFT_ASSET_ID_KEY: Final = Bytes("nft_asset_id")


# Local state suffixes --------------------------------------------------------------

REG_STATUS_KEY: Final = Bytes("registration_status")
REG_DATE_KEY: Final = Bytes("registration_date")
REG_TIER_KEY: Final = Bytes("ticket_tier")
REG_AMOUNT_KEY: Final = Bytes("payment_amount")
REG_NFT_KEY: Final = Bytes("nft_minted")


# Helper utilities -----------------------------------------------------------------


def event_key(event_id: Expr, suffix: Expr) -> Expr:
    """Compose the global/local state key for the given event."""

    return Concat(event_id, Bytes("::"), suffix)


def is_event_owner(event_id: Expr) -> Expr:
    return App.globalGet(event_key(event_id, OWNER_KEY)) == Txn.sender()


def is_event_active(event_id: Expr) -> Expr:
    expiry = App.globalGet(event_key(event_id, EXPIRY_DATE_KEY))
    return And(
        App.globalGet(event_key(event_id, ACTIVE_KEY)) == Int(1),
        Or(expiry == Int(0), expiry > Global.latest_timestamp()),
    )


def has_capacity(event_id: Expr) -> Expr:
    max_capacity = App.globalGet(event_key(event_id, MAX_CAPACITY_KEY))
    registered = App.globalGet(event_key(event_id, REGISTERED_COUNT_KEY))
    return Or(max_capacity == Int(0), registered < max_capacity)


def is_already_registered(event_id: Expr, account: Expr) -> Expr:
    return App.localGet(account, event_key(event_id, REG_STATUS_KEY)) != Int(0)


def dynamic_qr_contract() -> Expr:
    """Approval program for the DynaQR contract."""

    on_create = Seq(
        App.globalPut(EVENT_COUNT_KEY, Int(0)),
        App.globalPut(VERSION_KEY, Bytes("2.0.0")),
        App.globalPut(TOTAL_REGISTRATIONS_KEY, Int(0)),
        App.globalPut(TOTAL_REVENUE_KEY, Int(0)),
        Return(Int(1)),
    )

    event_id = Txn.application_args[1]

    existing_owner = App.globalGetEx(
        Global.current_application_id(), event_key(event_id, OWNER_KEY)
    )

    create_event_logic = Seq(
        Assert(Txn.application_args.length() >= Int(8)),
        existing_owner,
        Assert(existing_owner.hasValue() == Int(0)),
        App.globalPut(event_key(event_id, EVENT_NAME_KEY), Txn.application_args[2]),
        App.globalPut(event_key(event_id, CURRENT_URL_KEY), Txn.application_args[3]),
        App.globalPut(event_key(event_id, ACCESS_TYPE_KEY), Txn.application_args[4]),
        App.globalPut(event_key(event_id, EXPIRY_DATE_KEY), Btoi(Txn.application_args[5])),
        App.globalPut(event_key(event_id, TICKET_PRICE_KEY), Btoi(Txn.application_args[6])),
        App.globalPut(event_key(event_id, MAX_CAPACITY_KEY), Btoi(Txn.application_args[7])),
        App.globalPut(event_key(event_id, CREATED_AT_KEY), Global.latest_timestamp()),
        App.globalPut(event_key(event_id, OWNER_KEY), Txn.sender()),
        App.globalPut(event_key(event_id, SCAN_COUNT_KEY), Int(0)),
        App.globalPut(event_key(event_id, ACTIVE_KEY), Int(1)),
        App.globalPut(event_key(event_id, REGISTERED_COUNT_KEY), Int(0)),
        App.globalPut(event_key(event_id, NFT_ASSET_ID_KEY), Int(0)),
        App.globalPut(EVENT_COUNT_KEY, App.globalGet(EVENT_COUNT_KEY) + Int(1)),
        Return(Int(1)),
    )

    register_event_logic = Seq(
        Assert(Txn.application_args.length() >= Int(4)),
        Assert(is_event_active(event_id)),
        Assert(has_capacity(event_id)),
        Assert(is_already_registered(event_id, Txn.sender()) == Int(0)),
        App.localPut(Txn.sender(), event_key(event_id, REG_STATUS_KEY), Int(1)),
        App.localPut(
            Txn.sender(), event_key(event_id, REG_DATE_KEY), Global.latest_timestamp()
        ),
        App.localPut(
            Txn.sender(), event_key(event_id, REG_TIER_KEY), Btoi(Txn.application_args[2])
        ),
        App.localPut(
            Txn.sender(), event_key(event_id, REG_AMOUNT_KEY), Btoi(Txn.application_args[3])
        ),
        App.localPut(Txn.sender(), event_key(event_id, REG_NFT_KEY), Int(0)),
        App.globalPut(
            event_key(event_id, REGISTERED_COUNT_KEY),
            App.globalGet(event_key(event_id, REGISTERED_COUNT_KEY)) + Int(1),
        ),
        App.globalPut(
            TOTAL_REGISTRATIONS_KEY,
            App.globalGet(TOTAL_REGISTRATIONS_KEY) + Int(1),
        ),
        App.globalPut(
            TOTAL_REVENUE_KEY,
            App.globalGet(TOTAL_REVENUE_KEY) + Btoi(Txn.application_args[3]),
        ),
        Return(Int(1)),
    )

    confirm_attendance_logic = Seq(
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_already_registered(event_id, Txn.sender())),
        App.localPut(Txn.sender(), event_key(event_id, REG_STATUS_KEY), Int(2)),
        App.globalPut(
            event_key(event_id, SCAN_COUNT_KEY),
            App.globalGet(event_key(event_id, SCAN_COUNT_KEY)) + Int(1),
        ),
        Return(Int(1)),
    )

    mint_nft_logic = Seq(
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_already_registered(event_id, Txn.sender())),
        Assert(App.localGet(Txn.sender(), event_key(event_id, REG_STATUS_KEY)) == Int(2)),
        App.localPut(Txn.sender(), event_key(event_id, REG_NFT_KEY), Int(1)),
        App.globalPut(event_key(event_id, NFT_ASSET_ID_KEY), Btoi(Txn.application_args[2])),
        Return(Int(1)),
    )

    update_url_logic = Seq(
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_event_owner(event_id)),
        App.globalPut(event_key(event_id, CURRENT_URL_KEY), Txn.application_args[2]),
        Return(Int(1)),
    )

    update_ticket_price_logic = Seq(
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_event_owner(event_id)),
        App.globalPut(event_key(event_id, TICKET_PRICE_KEY), Btoi(Txn.application_args[2])),
        Return(Int(1)),
    )

    deactivate_event_logic = Seq(
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_owner(event_id)),
        App.globalPut(event_key(event_id, ACTIVE_KEY), Int(0)),
        Return(Int(1)),
    )

    increment_scan_logic = Seq(
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_active(event_id)),
        App.globalPut(
            event_key(event_id, SCAN_COUNT_KEY),
            App.globalGet(event_key(event_id, SCAN_COUNT_KEY)) + Int(1),
        ),
        Return(Int(1)),
    )

    refund_registration_logic = Seq(
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_owner(event_id)),
        App.globalPut(
            event_key(event_id, REGISTERED_COUNT_KEY),
            App.globalGet(event_key(event_id, REGISTERED_COUNT_KEY)) - Int(1),
        ),
        App.globalPut(
            TOTAL_REGISTRATIONS_KEY,
            App.globalGet(TOTAL_REGISTRATIONS_KEY) - Int(1),
        ),
        Return(Int(1)),
    )

    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.application_args[0] == CREATE_EVENT, create_event_logic],
        [Txn.application_args[0] == REGISTER_EVENT, register_event_logic],
        [Txn.application_args[0] == CONFIRM_ATTENDANCE, confirm_attendance_logic],
        [Txn.application_args[0] == MINT_NFT, mint_nft_logic],
        [Txn.application_args[0] == UPDATE_URL, update_url_logic],
        [Txn.application_args[0] == UPDATE_TICKET_PRICE, update_ticket_price_logic],
        [Txn.application_args[0] == DEACTIVATE_EVENT, deactivate_event_logic],
        [Txn.application_args[0] == INCREMENT_SCAN, increment_scan_logic],
        [Txn.application_args[0] == REFUND_REGISTRATION, refund_registration_logic],
    )


def clear_state_program() -> Expr:
    return Return(Int(1))


if __name__ == "__main__":
    approval = dynamic_qr_contract()
    clear = clear_state_program()
    with open("artifacts/approval.teal", "w", encoding="utf-8") as f:
        f.write(approval.__teal__()[1])
    with open("artifacts/clear.teal", "w", encoding="utf-8") as f:
        f.write(clear.__teal__()[1])
    print("✅ DynaQR contract generated in ./artifacts")
