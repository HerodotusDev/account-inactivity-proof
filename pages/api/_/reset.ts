import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "shared/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  if (req.query.key !== process.env.DEMO_RESET_KEY)
    return res.status(401).json({
      error: "Invalid key",
    });

  await prisma.proofTask.updateMany({
    where: {
      NOT: {
        AND: {
          taskStatus: "SCHEDULED",
          nonce: null,
        },
      },
    },
    data: {
      taskStatus: "SCHEDULED",
      nonce: null,
    },
  });

  await prisma.inactivityProof.updateMany({
    where: {
      NOT: {
        AND: {
          finalised: false,
          sinceNonce: null,
          untilNonce: null,
        },
      },
    },
    data: {
      finalised: false,
      sinceNonce: null,
      untilNonce: null,
    },
  });

  res.status(200).json({
    message: "Reset successful",
  });
}
