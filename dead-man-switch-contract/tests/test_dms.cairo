%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin

@contract_interface
namespace DeadManSwitch {
    func query_herodotus_facts_registry_nonce(account_160: felt, block: felt) -> (res: felt) {
    }

    func is_switch_triggerable(at_block: felt) -> (res: felt) {
    }
}

@contract_interface
namespace MockFactsRegistry {
    func prove_account_nonce(account_160: felt, at_block: felt, nonce: felt) -> (res: felt) {
    }
}

@external
func __setup__() {
    %{
        context.watched_account = 0x946F7Cc10FB0A6DC70860B6cF55Ef2C722cC7e1a
        last_known_activity_block_number = 8434785
        max_elapsed_inactivity_blocks = 100
        context.mocked_facts_registry_addr = deploy_contract("src/mock_facts_registry.cairo").contract_address
        context.dead_man_switch = deploy_contract("src/dead_man_switch.cairo", 
            [context.mocked_facts_registry_addr, context.watched_account, last_known_activity_block_number, max_elapsed_inactivity_blocks]
        ).contract_address
    %}
    return ();
}

@external
func test_query_herodotus_facts_registry_nonce{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() {
    alloc_locals;
    tempvar dead_man_switch;
    tempvar watched_account;
    tempvar facts_registry;
    %{
        ids.dead_man_switch = context.dead_man_switch 
        ids.watched_account = context.watched_account
        ids.facts_registry = context.mocked_facts_registry_addr
    %}

    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434785, nonce=8
    );
    let (nonce_before) = DeadManSwitch.query_herodotus_facts_registry_nonce(
        contract_address=dead_man_switch, account_160=watched_account, block=8434785
    );
    assert nonce_before = 8;

    // Simulate an account proof containing the verified nonce.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434901, nonce=9
    );

    let (nonce_after) = DeadManSwitch.query_herodotus_facts_registry_nonce(
        contract_address=dead_man_switch, account_160=watched_account, block=8434901
    );
    assert nonce_after = 9;

    return ();
}

@external
func test_is_dms_triggerable_after_valid_inactivity_delay{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() {
    alloc_locals;
    tempvar dead_man_switch;
    tempvar watched_account;
    tempvar facts_registry;
    %{
        ids.dead_man_switch = context.dead_man_switch 
        ids.watched_account = context.watched_account
        ids.facts_registry = context.mocked_facts_registry_addr
    %}

    // Prove start nonce.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434785, nonce=8
    );

    // Prove end nonce.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434901, nonce=8
    );

    let (is_triggerable) = DeadManSwitch.is_switch_triggerable(
        contract_address=dead_man_switch, at_block=8434901
    );
    assert is_triggerable = 1;

    return ();
}

@external
func test_is_dms_triggerable_after_invalid_inactivity_delay{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() {
    alloc_locals;
    tempvar dead_man_switch;
    tempvar watched_account;
    tempvar facts_registry;
    %{
        ids.dead_man_switch = context.dead_man_switch
        ids.watched_account = context.watched_account
        ids.facts_registry = context.mocked_facts_registry_addr
    %}

    // Prove start nonce.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434785, nonce=8
    );

    local too_early_block = 8434785 + 1;
    // Prove (too early) end block.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry,
        account_160=watched_account,
        at_block=too_early_block,
        nonce=8,
    );

    %{ expect_revert(error_message="Not enough time elapsed") %}
    DeadManSwitch.is_switch_triggerable(contract_address=dead_man_switch, at_block=too_early_block);
    return ();
}

@external
func test_is_dms_triggerable_after_activity{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() {
    alloc_locals;
    tempvar dead_man_switch;
    tempvar watched_account;
    tempvar facts_registry;
    %{
        ids.dead_man_switch = context.dead_man_switch 
        ids.watched_account = context.watched_account
        ids.facts_registry = context.mocked_facts_registry_addr
    %}

    // Prove start nonce.
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434785, nonce=8
    );

    // Simulate activity (nonce change).
    MockFactsRegistry.prove_account_nonce(
        contract_address=facts_registry, account_160=watched_account, at_block=8434901, nonce=9
    );

    let (is_triggerable) = DeadManSwitch.is_switch_triggerable(
        contract_address=dead_man_switch, at_block=8434901
    );
    assert is_triggerable = 0;

    return ();
}
