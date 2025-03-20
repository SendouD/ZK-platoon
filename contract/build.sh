rm -rf target

echo "Compiling contract: "
nargo execute
nargo compile

echo "Gate count: "
bb gates -b target/zk_platoon.json | jq  '.functions[0].circuit_size'

echo "Generating Key: "
bb write_vk_ultra_keccak_honk -b ./target/zk_platoon.json
bb contract_ultra_honk

echo "Done!"