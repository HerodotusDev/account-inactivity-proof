%lang starknet
from starkware.cairo.common.math import assert_nn, assert_le
from starkware.cairo.common.cairo_builtins import HashBuiltin

@contract_interface
namespace HerodotusFactsRegistry {
    func get_verified_account_nonce(account_160: felt, block: felt) -> (res: felt) {
    }

    func is_nonce_proven(account_160: felt, block: felt) -> (res: felt) {
    }
}

@storage_var
func _watched_account() -> (res: felt) {
}

@storage_var
func _last_known_activity_block_number() -> (res: felt) {
}

@storage_var
func _max_elapsed_inactivity_blocks() -> (res: felt) {
}

@storage_var
func _herodotus_facts_registry() -> (res: felt) {
}

@view
func query_herodotus_facts_registry_nonce{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}(account_160: felt, block: felt) -> (res: felt) {
    let (facts_registry_addr) = _herodotus_facts_registry.read();

    // Check that the nonce has been proven.
    let (is_proven) = HerodotusFactsRegistry.is_nonce_proven(
        contract_address=facts_registry_addr, account_160=account_160, block=block
    );
    assert is_proven = 1;

    let (nonce) = HerodotusFactsRegistry.get_verified_account_nonce(
        contract_address=facts_registry_addr, account_160=account_160, block=block
    );
    return (res=nonce);
}

@view
func is_switch_triggerable{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    at_block: felt
) -> (res: felt) {
    alloc_locals;
    let (watched_account) = _watched_account.read();
    let (last_known_activity_block_number) = _last_known_activity_block_number.read();

    let (start_nonce) = query_herodotus_facts_registry_nonce(
        account_160=watched_account, block=last_known_activity_block_number
    );

    let (end_nonce) = query_herodotus_facts_registry_nonce(
        account_160=watched_account, block=at_block
    );

    local delta = at_block - last_known_activity_block_number;
    with_attr error_message("Delta between blocks must be positive. Got: {delta}.") {
        assert_nn(delta);
    }
    let (local max_elapsed_inactivity_blocks) = _max_elapsed_inactivity_blocks.read();
    with_attr error_message(
            "Not enough time elapsed. Elapsed: {delta} blocks; Required: {max_elapsed_inactivity_blocks} blocks.") {
        assert_le(max_elapsed_inactivity_blocks, delta);
    }
    if (start_nonce == end_nonce) {
        return (res=1);
    }
    return (res=0);
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    herodotus_facts_registry_addr: felt,
    watched_account: felt,
    last_known_activity_block_number: felt,
    max_elapsed_inactivity_blocks: felt,
) {
    // Source of truth.
    _herodotus_facts_registry.write(herodotus_facts_registry_addr);

    _watched_account.write(watched_account);  // The account to watch for inactivity.
    _last_known_activity_block_number.write(last_known_activity_block_number);  // Last activity block number (start block).
    _max_elapsed_inactivity_blocks.write(max_elapsed_inactivity_blocks);  // Max inactivity duration (in blocks).
    return ();
}
