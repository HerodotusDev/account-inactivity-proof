import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkForNonce, Update } from "shared/checkForNonce";
import { prisma } from "shared/db";
import { ProofTask } from "types";

export default async function askHerodotusForUpdates(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const key = req.query.key as string;
  if (key !== process.env.CRONS_KEY)
    return res.status(401).json({ message: "Invalid key" });

  //? Get all ProofTasks with statuses SCHEDULED, PROCESSING and FINALIZED
  const proofTasks = (await prisma.proofTask.findMany({
    where: {
      OR: [
        { taskStatus: "SCHEDULED" },
        { taskStatus: "PROCESSING" },
        { taskStatus: "FINALIZED" },
      ],
    },
  })) as ProofTask[];
  if (!proofTasks.length)
    return res.status(200).json({ message: "No tasks to update" });

  //? Get the status of each ProofTask from Herodotus
  const updates = await Promise.all(proofTasks.map(getStatusFromHerodotus));
  //? Update the ProofTasks in the database
  await Promise.all(
    updates.filter(Boolean).map((u) => prisma.proofTask.update(u))
  );

  res.status(200).json({ message: "Cron job ran successfully" });
}

const getStatusFromHerodotus = async (
  pt: ProofTask
): Promise<Update | null> => {
  const taskFromHerodotus = await axios
    .get(`${process.env.API_URL}/status/${pt.taskId}`, {
      params: {
        apiKey: process.env.API_KEY,
      },
    })
    .then((res) => res.data);
  if (
    !taskFromHerodotus?.taskStatus ||
    taskFromHerodotus.taskStatus === pt.taskStatus
  )
    return null;

  return checkForNonce(
    pt.taskId,
    taskFromHerodotus.taskStatus,
    pt.account,
    pt.blockNumber
  );
};
