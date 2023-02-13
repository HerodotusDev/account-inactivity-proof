#!/bin/bash

if [[ $* == *"--skip-build"* ]]; then
    echo "Skipping protostar build"
else
    protostar build
    if [ $? -eq 0 ]; then
        echo "Build succeeded"
    else
        echo "Build failed" && exit
    fi
fi

echo "Declaring contracts..."

# Note: PROTOSTAR_ACCOUNT_PRIVATE_KEY env variable has to be set.

class_hash_mock_facts_registry=$(protostar -p testnet declare ./build/MockFactsRegistry.json --max-fee auto --json  --wait-for-acceptance | jq -r '.class_hash')
class_hash_dead_man_switch=$(protostar -p testnet declare ./build/DeadManSwitch.json --max-fee auto --json  --wait-for-acceptance | jq -r '.class_hash')

echo "Deploying contracts..."

mock_facts_registry_addr=$(protostar -p testnet deploy $class_hash_mock_facts_registry --max-fee auto --json --wait-for-acceptance | jq -r '.contract_address')

watched_account=0x946F7Cc10FB0A6DC70860B6cF55Ef2C722cC7e1a
last_known_activity_block_number=8434785
max_elapsed_inactivity_blocks=100
inputs="herodotus_facts_registry_addr=$mock_facts_registry_addr watched_account=$watched_account last_known_activity_block_number=$last_known_activity_block_number max_elapsed_inactivity_blocks=$max_elapsed_inactivity_blocks"
dead_man_switch_addr=$(protostar -p testnet deploy $class_hash_dead_man_switch --inputs $inputs --max-fee auto --json --wait-for-acceptance | jq -r '.contract_address')

printf "MockFactsRegistry contract address: %s\nDeadManSwitch contract address: %s\n" "$mock_facts_registry_addr" "$dead_man_switch_addr"

exit 0