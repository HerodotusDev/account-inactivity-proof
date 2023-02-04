import styled from "@emotion/styled";
import { InactivityProof } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { ListOfJSONs } from "./db-preview";

export default function Index({
  inactivityProof,
}: {
  inactivityProof?: InactivityProof;
}) {
  const [address, setAddress] = React.useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const handleClick = () => router.push("/proof/63de9cfaac18f288c9716d60");
  // await axios
  //   .get<InactivityProof>(`/api/prove/${address}/inactivity`)
  //   .then((res) => res?.data?.id && router.push(`/proof/${res.data.id}`));

  return (
    <>
      <Layout>
        {inactivityProof ? (
          <>
            <Label>Current state of the proof:</Label>
            <SubLabel>
              {
                "if (finalised === true and sinceNonce === untilNonce) the proof is valid"
              }
            </SubLabel>
            <SubLabel>
              Is the proof valid:{" "}
              {inactivityProof.finalised
                ? inactivityProof.sinceNonce === inactivityProof.untilNonce
                  ? "Yes"
                  : "No"
                : "Pending"}
            </SubLabel>
            <ListOfJSONs>
              <code>{JSON.stringify(inactivityProof, null, 2)}</code>
            </ListOfJSONs>
            <SneakyLink bottom="calc(24px + 1rem + 8px)" href="/">
              home
            </SneakyLink>
          </>
        ) : (
          <>
            <Label>Retrieve a lost account</Label>
            <SubLabel>
              (generate proof that an account has been inactive for a year)
            </SubLabel>
            <Input
              type="text"
              placeholder="address"
              value={address}
              onChange={handleChange}
            />
            <Button onClick={handleClick}>Generate</Button>
          </>
        )}
      </Layout>
      <SneakyLink href="/db-preview">/db-preview</SneakyLink>
    </>
  );
}

export const SneakyLink = styled(Link)<{ bottom?: string }>`
  position: absolute;
  bottom: ${({ bottom }) => bottom || "24px"};
  left: 24px;

  color: #fda08550;
`;

const Input = styled.input`
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border: none;
  border-radius: 5px;
  padding: 10px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  outline: none;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease-in-out;
  box-shadow: 0 0 0 0.5px #fda085;
  min-width: 30%;
  text-align: center;

  &:hover {
    cursor: pointer;
    filter: brightness(1.1);
  }

  &:focus {
    box-shadow: 0 0 0 1px #f6d365, 0 0 0 4px #fda085;
    cursor: text;
  }
`;

const Label = styled.span`
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: block;
`;

const SubLabel = styled.span`
  background: linear-gradient(90deg, #fda085 0%, #f6d365 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 32px;
  display: block;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10vh;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border: none;
  border-radius: 5px;
  padding: 10px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  outline: none;
  transition: box-shadow 0.15s ease-in-out;
  box-shadow: 0 0 0 2px #fda085;
  user-select: none;
  text-transform: uppercase;
  margin-bottom: 32px;

  &:hover {
    cursor: pointer;
    filter: brightness(1.1);
  }

  &:active {
    box-shadow: 0 0 0 1px #f6d365, 0 0 0 4px #fda085;
  }
`;
