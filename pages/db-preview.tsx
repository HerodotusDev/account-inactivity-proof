import React, { useEffect } from "react";
import { ProofTask } from "types";
import { prisma } from "shared/db";
import styled from "@emotion/styled";
import { getInfoFromFactsRegistry } from "shared/getInfoFromFactsRegistry";
import { InactivityProof } from "@prisma/client";
import { SneakyLink } from "pages";

export default function DbPreview({
  proofTasks,
  inactivityProofs,
}: {
  proofTasks: ProofTask[];
  inactivityProofs: InactivityProof[];
}) {
  useEffect(() => {
    const account = "0x946F7Cc10FB0A6DC70860B6cF55Ef2C722cC7e1a";
    const blockNumber = 8386177;
    getInfoFromFactsRegistry(account, blockNumber).then((nonce) =>
      console.log(nonce)
    );
  }, []);

  return (
    <>
      <Split>
        <ListOfJSONs>
          <Title>Proof Tasks</Title>
          {proofTasks.map((proofTask) => (
            <code key={proofTask.taskId}>
              {JSON.stringify(proofTask, null, 2)}
            </code>
          ))}
        </ListOfJSONs>
        <ListOfJSONs>
          <Title>Inactivity Proofs</Title>
          {inactivityProofs.map((inactivityProof) => (
            <code key={inactivityProof.id}>
              {JSON.stringify(inactivityProof, null, 2)}
            </code>
          ))}
        </ListOfJSONs>
      </Split>
      <SneakyLink href="/">home</SneakyLink>
    </>
  );
}

export async function getStaticProps() {
  const proofTasks = (await prisma.proofTask.findMany()) as ProofTask[];
  const inactivityProofs =
    (await prisma.inactivityProof.findMany()) as InactivityProof[];

  return {
    props: { proofTasks, inactivityProofs },
    revalidate: 10,
  };
}

const Split = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 10%;
  justify-content: center;
`;

const Title = styled.h3``;

export const ListOfJSONs = styled.div`
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;
`;
