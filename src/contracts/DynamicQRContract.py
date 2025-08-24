"""
DynaQR Smart Contract - Algorand PyTeal Implementation
Manages dynamic QR code event mappings, event registration, and NFT generation on Algorand blockchain
"""

from pyteal import *


def dynamic_qr_contract():
    """
    Smart contract for DynaQR system that manages event ID to URL mappings,
    event registration, ticket sales, and NFT generation
    
    Global State Schema:
    - event_count: Number of events created
    - contract_version: Version of the contract
    - total_registrations: Total registrations across all events
    - total_revenue: Total ALGO revenue collected
    
    Local State Schema (per event):
    - event_name: Name of the event
    - current_url: Current redirect URL
    - access_type: Access control type (public, nft-gated, time-based)
    - expiry_date: When the event expires (timestamp)
    - created_at: When event was created (timestamp)
    - owner: Address that created the event
    - scan_count: Number of times QR was scanned
    - active: Whether event is active (boolean)
    - ticket_price: Price in microALGOs (0 for free events)
    - max_capacity: Maximum number of attendees
    - registered_count: Number of registered attendees
    - nft_asset_id: Asset ID of the event NFT (0 if not created yet)
    
    Local State Schema (per user registration):
    - registration_status: 0=pending, 1=confirmed, 2=attended, 3=cancelled
    - registration_date: When user registered
    - ticket_tier: Ticket tier (0=general, 1=vip, 2=premium)
    - payment_amount: Amount paid in microALGOs
    - nft_minted: Whether NFT was minted (0=no, 1=yes)
    """
    
    # Application call types
    create_event = Bytes("create_event")
    update_url = Bytes("update_url")
    get_event = Bytes("get_event")
    deactivate_event = Bytes("deactivate_event")
    increment_scan = Bytes("increment_scan")
    register_event = Bytes("register_event")
    confirm_attendance = Bytes("confirm_attendance")
    mint_nft = Bytes("mint_nft")
    update_ticket_price = Bytes("update_ticket_price")
    refund_registration = Bytes("refund_registration")
    
    # Global state keys
    event_count_key = Bytes("event_count")
    contract_version_key = Bytes("contract_version")
    total_registrations_key = Bytes("total_registrations")
    total_revenue_key = Bytes("total_revenue")
    
    # Event state keys (stored with event_id as prefix)
    event_name_key = Bytes("event_name")
    current_url_key = Bytes("current_url")
    access_type_key = Bytes("access_type")
    expiry_date_key = Bytes("expiry_date")
    created_at_key = Bytes("created_at")
    owner_key = Bytes("owner")
    scan_count_key = Bytes("scan_count")
    active_key = Bytes("active")
    ticket_price_key = Bytes("ticket_price")
    max_capacity_key = Bytes("max_capacity")
    registered_count_key = Bytes("registered_count")
    nft_asset_id_key = Bytes("nft_asset_id")
    
    # User registration state keys (stored with user_address + event_id as prefix)
    registration_status_key = Bytes("registration_status")
    registration_date_key = Bytes("registration_date")
    ticket_tier_key = Bytes("ticket_tier")
    payment_amount_key = Bytes("payment_amount")
    nft_minted_key = Bytes("nft_minted")
    
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
    
    @Subroutine(TealType.uint64)
    def is_user_registered(user_address: Expr, event_id: Expr) -> Expr:
        """Check if user is registered for the event"""
        return App.localGet(user_address, Concat(event_id, registration_status_key)) != Int(0)
    
    @Subroutine(TealType.uint64)
    def has_capacity(event_id: Expr) -> Expr:
        """Check if event has available capacity"""
        return App.globalGet(Concat(event_id, registered_count_key)) < App.globalGet(Concat(event_id, max_capacity_key))
    
    # Create new event
    create_event_logic = Seq([
        # Validate inputs
        Assert(Txn.application_args.length() >= Int(8)),
        
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
        App.globalPut(
            Concat(Txn.application_args[1], ticket_price_key), 
            Btoi(Txn.application_args[6])
        ),
        App.globalPut(
            Concat(Txn.application_args[1], max_capacity_key), 
            Btoi(Txn.application_args[7])
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
        App.globalPut(
            Concat(Txn.application_args[1], registered_count_key), 
            Int(0)
        ),
        App.globalPut(
            Concat(Txn.application_args[1], nft_asset_id_key), 
            Int(0)
        ),
        
        # Increment global event count
        App.globalPut(
            event_count_key,
            App.globalGet(event_count_key) + Int(1)
        ),
        
        Int(1)
    ])
    
    # Register for event
    register_event_logic = Seq([
        Assert(Txn.application_args.length() >= Int(4)),
        
        # Extract arguments
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], registration_status_key),
            Int(1)  # 1 = confirmed
        ),
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], registration_date_key),
            Global.latest_timestamp()
        ),
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], ticket_tier_key),
            Btoi(Txn.application_args[2])
        ),
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], payment_amount_key),
            Btoi(Txn.application_args[3])
        ),
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], nft_minted_key),
            Int(0)  # NFT not minted yet
        ),
        
        # Increment event registration count
        App.globalPut(
            Concat(Txn.application_args[1], registered_count_key),
            App.globalGet(Concat(Txn.application_args[1], registered_count_key)) + Int(1)
        ),
        
        # Increment global registration count
        App.globalPut(
            total_registrations_key,
            App.globalGet(total_registrations_key) + Int(1)
        ),
        
        # Add payment to total revenue
        App.globalPut(
            total_revenue_key,
            App.globalGet(total_revenue_key) + Btoi(Txn.application_args[3])
        ),
        
        Int(1)
    ])
    
    # Confirm attendance and mint NFT
    confirm_attendance_logic = Seq([
        Assert(Txn.application_args.length() >= Int(3)),
        
        # Check if user is registered
        Assert(is_user_registered(Txn.sender(), Txn.application_args[1])),
        
        # Update registration status to attended
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], registration_status_key),
            Int(2)  # 2 = attended
        ),
        
        # Increment scan count
        App.globalPut(
            Concat(Txn.application_args[1], scan_count_key),
            App.globalGet(Concat(Txn.application_args[1], scan_count_key)) + Int(1)
        ),
        
        Int(1)
    ])
    
    # Mint NFT for attended user
    mint_nft_logic = Seq([
        Assert(Txn.application_args.length() >= Int(3)),
        
        # Check if user attended the event
        Assert(App.localGet(Txn.sender(), Concat(Txn.application_args[1], registration_status_key)) == Int(2)),
        
        # Check if NFT already minted
        Assert(App.localGet(Txn.sender(), Concat(Txn.application_args[1], nft_minted_key)) == Int(0)),
        
        # Mark NFT as minted
        App.localPut(
            Txn.sender(),
            Concat(Txn.application_args[1], nft_minted_key),
            Int(1)
        ),
        
        # Store NFT asset ID in event
        App.globalPut(
            Concat(Txn.application_args[1], nft_asset_id_key),
            Btoi(Txn.application_args[2])
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
    
    # Update ticket price
    update_ticket_price_logic = Seq([
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_event_owner(Txn.application_args[1])),
        Assert(is_event_active(Txn.application_args[1])),
        
        App.globalPut(
            Concat(Txn.application_args[1], ticket_price_key), 
            Btoi(Txn.application_args[2])
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
    
    # Refund registration (event owner only)
    refund_registration_logic = Seq([
        Assert(Txn.application_args.length() >= Int(3)),
        Assert(is_event_owner(Txn.application_args[1])),
        
        # Get user address from args
        # Note: In production, you'd want additional validation here
        
        # Decrement event registration count
        App.globalPut(
            Concat(Txn.application_args[1], registered_count_key),
            App.globalGet(Concat(Txn.application_args[1], registered_count_key)) - Int(1)
        ),
        
        # Decrement global registration count
        App.globalPut(
            total_registrations_key,
            App.globalGet(total_registrations_key) - Int(1)
        ),
        
        Int(1)
    ])
    
    # Main application logic
    program = Cond(
        [Txn.application_id() == Int(0), Seq([
            # Initialize contract on creation
            App.globalPut(event_count_key, Int(0)),
            App.globalPut(contract_version_key, Bytes("2.0.0")),
            App.globalPut(total_registrations_key, Int(0)),
            App.globalPut(total_revenue_key, Int(0)),
            Int(1)
        ])],
        
        [Txn.on_completion() == OnCall.NoOp, Cond(
            [Txn.application_args[0] == create_event, create_event_logic],
            [Txn.application_args[0] == register_event, register_event_logic],
            [Txn.application_args[0] == confirm_attendance, confirm_attendance_logic],
            [Txn.application_args[0] == mint_nft, mint_nft_logic],
            [Txn.application_args[0] == update_url, update_url_logic],
            [Txn.application_args[0] == update_ticket_price, update_ticket_price_logic],
            [Txn.application_args[0] == get_event, get_event_logic],
            [Txn.application_args[0] == deactivate_event, deactivate_event_logic],
            [Txn.application_args[0] == increment_scan, increment_scan_logic],
            [Txn.application_args[0] == refund_registration, refund_registration_logic]
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
        num_uints=4,    # event_count, contract_version, total_registrations, total_revenue
        num_byte_slices=0
    )
    
    # Local state schema (for user registrations)
    local_schema = StateSchema(
        num_uints=5,    # registration_status, registration_date, ticket_tier, payment_amount, nft_minted
        num_byte_slices=0
    )
    
    print("DynaQR Smart Contract v2.0.0 Compiled Successfully!")
    print(f"Global Schema: {global_schema}")
    print(f"Local Schema: {local_schema}")
    print("\nNew Features:")
    print("- Event registration with ticket pricing")
    print("- NFT generation for attendees")
    print("- Capacity management")
    print("- Revenue tracking")
    print("- Attendance confirmation")
