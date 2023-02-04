import axios from "axios";
import { ethers } from "ethers";
import { v4 as uuid } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "shared/db";
import { CHAINS, TaskType } from "types";
import { SinceOrUntil } from "@prisma/client";

// const ONE_YEAR_BLOCK_DISTANCE = 2_130_412;
const ONE_YEAR_BLOCK_DISTANCE = 100;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const account = req.query.account as string;
  const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC_URL);

  const until = {
      blockNumber: await provider.getBlockNumber(),
      token: uuid(),
      sinceOrUntil: SinceOrUntil.until,
    },
    since = {
      blockNumber: until.blockNumber - ONE_YEAR_BLOCK_DISTANCE,
      token: uuid(),
      sinceOrUntil: SinceOrUntil.since,
    };

  //? Create the InteractivityProof in the db
  const inactivityProof = await prisma.inactivityProof.create({
    data: {
      untilBlockNumber: until.blockNumber,
      sinceBlockNumber: since.blockNumber,
      account,
      finalised: false,
      sinceNonce: null,
      untilNonce: null,
    },
  });

  //? Calls to Herodotus API
  const herodotusTasks = await Promise.all(
    [until, since].map(({ blockNumber, token, sinceOrUntil }) =>
      axios
        .post(
          process.env.API_URL + "/",
          {
            originChain: CHAINS.GOERLI,
            destinationChain: CHAINS.STARKNET_GOERLI_V2,
            blockNumber,
            //? This is the URL of this API /webhook endpoint
            webhookUrl: `${process.env.WEBHOOK_URL}/${token}`,
            type: TaskType.ACCOUNT_ACCESS,
            requestedProperties: {
              [TaskType.ACCOUNT_ACCESS]: {
                account,
                properties: ["nonce"],
              },
            },
          },
          {
            params: {
              apiKey: process.env.API_KEY,
            },
          }
        )
        .then((res) => (res.data ? { ...res.data, token, sinceOrUntil } : null))
    )
  );

  const proofTasks = herodotusTasks.map((task) => ({
    taskId: task.taskId,
    taskStatus: task.taskStatus,
    originChain: task.originChain,
    destinationChain: task.destinationChain,
    blockNumber: task.blockNumber,
    type: task.type,
    scheduledAt: task.scheduledAt,
    account,
    inactivityProofId: inactivityProof.id,
    nonce: null,
    //? This is the token that will be used to identify the webhook request
    token: task.token,
    sinceOrUntil: task.sinceOrUntil,
  }));

  await prisma.proofTask.createMany({
    data: proofTasks,
  });

  res.status(200).json(inactivityProof);
}
