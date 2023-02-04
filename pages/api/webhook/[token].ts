import type { NextApiRequest, NextApiResponse } from "next";
import { checkForNonce } from "shared/checkForNonce";
import { prisma } from "shared/db";
import { TaskType } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.query.token as string;
  const proofTask = await prisma.proofTask.findUnique({
    where: { token },
  });
  if (!proofTask) return res.status(400).json({ message: "Invalid token" });

  const { taskId, taskStatus, requestedProperties, blockNumber } = req.body;
  if (proofTask.taskId !== taskId)
    return res.status(400).json({ message: "Invalid taskId" });

  const account = requestedProperties[TaskType.ACCOUNT_ACCESS].account;

  const update = await checkForNonce(taskId, taskStatus, account, blockNumber);
  await prisma.proofTask.update(update);

  res.status(200).json({ message: "Webhook ran successfully!" });
}
