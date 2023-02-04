import { ProofTask } from "types";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "shared/db";
import { ReadyTaskStatuses } from "types";

type Update = {
  where: { id: string };
  data: { finalised?: boolean; sinceNonce?: string; untilNonce?: string };
};

export default async function finaliseInactivityProofs(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const key = req.query.key as string;
  if (key !== process.env.CRONS_KEY)
    return res.status(401).json({ message: "Invalid key" });

  const inactivityProofs = await prisma.inactivityProof.findMany({
    where: {
      finalised: false,
    },
  });
  if (!inactivityProofs.length)
    return res.status(200).json({ message: "No InactivityProofs to finalise" });

  await Promise.all(
    inactivityProofs.map(async (ip) => {
      const proofTask = (await prisma.proofTask.findMany({
        where: { inactivityProofId: ip.id },
      })) as ProofTask[];
      if (!proofTask.length)
        return console.log(`InactivityProof ${ip.id} has no ProofTasks`);

      const update: Update = {
        where: { id: ip.id },
        data: {},
      };

      //? Check if all ProofTasks are finalised
      const finalised = proofTask.every((pt) => {
        if (ReadyTaskStatuses.includes(pt.taskStatus) && pt.nonce !== null) {
          //? If the ProofTask is finalised, add the nonce to the InactivityProof, even if other ProofTasks are not finalised yet
          update.data[pt.sinceOrUntil + "Nonce"] = pt.nonce;
          return true;
        }
        return false;
      });
      //? If all ProofTasks are finalised, set the InactivityProof to finalised
      if (finalised) update.data.finalised = finalised;

      //? Don't update the database if there's nothing to update
      if (Object.keys(update.data).length > 0)
        await prisma.inactivityProof.update(update);
    })
  );

  res.status(200).json({ message: "Webhook ran successfully!" });
}
