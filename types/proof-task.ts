import { SinceOrUntil } from "@prisma/client";

export enum TaskStatus {
  SCHEDULED = "SCHEDULED",
  PROCESSING = "PROCESSING",
  FINALIZED = "FINALIZED",
  WEBHOOK_SENT = "WEBHOOK_SENT",
  WEBHOOK_FAILED = "WEBHOOK_FAILED",
}

export const ReadyTaskStatuses = [
  TaskStatus.FINALIZED,
  TaskStatus.WEBHOOK_FAILED,
  TaskStatus.WEBHOOK_SENT,
];

export enum CHAINS {
  STARKNET_GOERLI = "STARKNET_GOERLI",
  STARKNET_GOERLI_V2 = "STARKNET_GOERLI_V2",
  GOERLI = "GOERLI",
  POLYGON = "POLYGON",
  OPTIMISM_GOERLI = "OPTIMISM_GOERLI",
}

export enum TaskType {
  HEADER_ACCESS = "HEADER_ACCESS",
  ACCOUNT_ACCESS = "ACCOUNT_ACCESS",
  STORAGE_ACCESS = "STORAGE_ACCESS",
  TRANSACTION_ACCESS = "TRANSACTION_ACCESS",
  RECEIPT_ACCESS = "RECEIPT_ACCESS",
}

export interface ProofTask {
  taskId: string;
  taskStatus: TaskStatus;
  originChain: CHAINS;
  destinationChain: CHAINS;
  blockNumber: number;
  type: TaskType;
  scheduledAt: number;
  account: string;
  nonce?: string;
  sinceOrUntil: SinceOrUntil;
}
