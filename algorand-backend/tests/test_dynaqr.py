"""Lightweight smoke tests for the DynaQR PyTeal contract."""

from pyteal import Mode, compileTeal

from contracts.dynaqr_contract import clear_state_program, dynamic_qr_contract


def test_compile_approval_program() -> None:
    teal_source = compileTeal(dynamic_qr_contract(), Mode.Application, version=8)
    assert "create_event" in teal_source
    assert "register_event" in teal_source


def test_compile_clear_program() -> None:
    teal_source = compileTeal(clear_state_program(), Mode.Application, version=8)
    assert teal_source.strip() != ""
