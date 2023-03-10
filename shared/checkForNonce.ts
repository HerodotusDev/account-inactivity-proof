import { ProofTask } from "@prisma/client";
import { ReadyTaskStatuses, TaskStatus } from "types";
import { getInfoFromFactsRegistry } from "./getInfoFromFactsRegistry";

export interface Update {
  where: { taskId: string };
  data: { taskStatus: TaskStatus; nonce?: string };
}

export const checkForNonce = async (
  taskId: ProofTask["taskId"],
  taskStatus: ProofTask["taskStatus"],
  account: ProofTask["account"],
  blockNumber: ProofTask["blockNumber"]
) => {
  const update: Update = {
    where: {
      taskId: taskId,
    },
    data: { taskStatus: TaskStatus[taskStatus] },
  };

  if (ReadyTaskStatuses.includes(taskStatus as TaskStatus)) {
    update.data.nonce = await getInfoFromFactsRegistry(
      account,
      blockNumber
    ).then((bn) => bn.toString());
  }
  console.log("update", update);

  return update;
};
