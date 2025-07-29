"""
DynaQR Smart Contract - Algorand PyTeal Implementation
Manages dynamic QR code event mappings on Algorand blockchain
"""

from pyteal import *


def dynamic_qr_contract():
    """
    Smart contract for DynaQR system that manages event ID to URL mappings
    
    Global State Schema:
    - event_count: Number of events created
    - contract_version: Version of the contract
    
    Local State Schema (per event):
    - event_name: Name of the event
    - current_url: Current redirect URL
    - access_type: Access control type (public, nft-gated, time-based)
    - expiry_date: When the event expires (timestamp)
    - created_at: When event was created (timestamp)
    - owner: Address that created the event
    - scan_count: Number of times QR was scanned
    - active: Whether event is active (boolean)
    """
    
    # Application call types
    create_event = Bytes("create_event")
    update_url = Bytes("update_url")
    get_event = Bytes("get_event")
    deactivate_event = Bytes("deactivate_event")
    increment_scan = Bytes("increment_scan")
    
    # Global state keys
    event_count_key = Bytes("event_count")
    contract_version_key = Bytes("contract_version")
    
    # Event state keys (stored with event_id as prefix)
    event_name_key = Bytes("event_name")
    current_url_key = Bytes("current_url")
    access_type_key = Bytes("access_type")
    expiry_date_key = Bytes("expiry_date")
    created_at_key = Bytes("created_at")
    owner_key = Bytes("owner")
    scan_count_key = Bytes("scan_count")
    active_key = Bytes("active")
    
    @Subroutine(TealType.uint64)
    def is_event_owner(event_id: Expr) -> Expr:
        """Check if sender is the owner of the event"""
        return App.globalGet(Concat(event_id, owner_key)) == Txn.sender()
    
    @Subroutine(TealType.uint64)
    def is_event_active(event_id: Expr) -> Expr:
        """Check if event is active and not expired"""
        return And(
            App.globalGet(Concat(event_id, active_key)) == Int(1),
            Or(
                App.globalGet(Concat(event_id, expiry_date_key)) == Int(0),  # No expiry
                App.globalGet(Concat(event_id, expiry_date_key)) > Global.latest_timestamp()
            )
        )
    
    # Create new event
    create_event_logic = Seq([
        # Validate inputs
        Assert(Txn.application_args.length() >= Int(6)),
        
        # Extract arguments
        App.globalPut(
            Concat(Txn.application_args[1], event_name_key), 
            Txn.application_args[2]
        ),
        App.globalPut(
            Concat(Txn.application_args[1], current_url_key), 
            Txn.application_args[3]
        ),
        App.globalPut(
            Concat(Txn.application_args[1], access_type_key), 
            Txn.application_args[4]
        ),
        App.globalPut(
            Concat(Txn.application_args[1], expiry_date_key), 
            Btoi(Txn.application_args[5])
        ),
        
        # Set metadata
        App.globalPut(
            Concat(Txn.application_args[1], created_at_key), 
            Global.latest_timestamp()
        ),
        App.globalPut(
            Concat(Txn.application_args[1], owner_key), 
            Txn.sender()
        ),
        App.globalPut(
            Concat(Txn.application_args[1], scan_count_key), 
            Int(0)
        ),
        App.globalPut(
            Concat(Txn.application_args[1], active_key), 
            Int(1)
        ),
        
        # Increment global event count
        App.globalPut(
            event_count_key,
            App.globalGet(event_count_key) + Int(1)
        ),
        
        Int(1)
    ])
    
    # Update event URL
    update_url_logic = Seq([
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_event_owner(Txn.application_args[1])),
        Assert(is_event_active(Txn.application_args[1])),
        
        App.globalPut(
            Concat(Txn.application_args[1], current_url_key), 
            Txn.application_args[2]
        ),
        
        Int(1)
    ])
    
    # Get event details (read-only)
    get_event_logic = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_active(Txn.application_args[1])),
        Int(1)
    ])
    
    # Deactivate event
    deactivate_event_logic = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_owner(Txn.application_args[1])),
        
        App.globalPut(
            Concat(Txn.application_args[1], active_key), 
            Int(0)
        ),
        
        Int(1)
    ])
    
    # Increment scan count (public operation)
    increment_scan_logic = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(is_event_active(Txn.application_args[1])),
        
        App.globalPut(
            Concat(Txn.application_args[1], scan_count_key),
            App.globalGet(Concat(Txn.application_args[1], scan_count_key)) + Int(1)
        ),
        
        Int(1)
    ])
    
    # Main application logic
    program = Cond(
        [Txn.application_id() == Int(0), Seq([
            # Initialize contract on creation
            App.globalPut(event_count_key, Int(0)),
            App.globalPut(contract_version_key, Bytes("1.0.0")),
            Int(1)
        ])],
        
        [Txn.on_completion() == OnCall.NoOp, Cond(
            [Txn.application_args[0] == create_event, create_event_logic],
            [Txn.application_args[0] == update_url, update_url_logic],
            [Txn.application_args[0] == get_event, get_event_logic],
            [Txn.application_args[0] == deactivate_event, deactivate_event_logic],
            [Txn.application_args[0] == increment_scan, increment_scan_logic]
        )],
        
        [Txn.on_completion() == OnCall.OptIn, Int(1)],
        [Txn.on_completion() == OnCall.CloseOut, Int(1)],
        [Txn.on_completion() == OnCall.UpdateApplication, Int(0)],  # Disable updates
        [Txn.on_completion() == OnCall.DeleteApplication, Int(0)]   # Disable deletion
    )
    
    return program


def clear_state_program():
    """Clear state program - always allow"""
    return Int(1)


if __name__ == "__main__":
    # Compile the contract
    approval_program = dynamic_qr_contract()
    clear_program = clear_state_program()
    
    # Global state schema
    global_schema = StateSchema(
        num_uints=2,    # event_count, contract_version
        num_byte_slices=0
    )
    
    # Local state schema (not used in this implementation)
    local_schema = StateSchema(
        num_uints=0,
        num_byte_slices=0
    )
    
    print("DynaQR Smart Contract Compiled Successfully!")
    print(f"Global Schema: {global_schema}")
    print(f"Local Schema: {local_schema}")
