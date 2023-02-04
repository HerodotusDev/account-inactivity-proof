import { Contract, Provider } from "starknet";
import { ProofTask } from "types";

const FACTS_REGISTRY = process.env.NEXT_PUBLIC_FACTS_REGISTRY;

export const getInfoFromFactsRegistry = async (
  account: ProofTask["account"],
  blockNumber: ProofTask["blockNumber"]
) => {
  const provider = new Provider({ sequencer: { network: "goerli-alpha" } });
  const { abi: testAbi } = await provider.getClassAt(FACTS_REGISTRY);
  const factsRegistry = new Contract(testAbi, FACTS_REGISTRY, provider);
  const nonce = await factsRegistry.call("get_verified_account_nonce", [
    account,
    blockNumber,
  ]);
  return BigInt(nonce.toString());
};
