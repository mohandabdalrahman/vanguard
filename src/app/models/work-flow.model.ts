import { SystemType } from "@models/system-type";

export interface WorkFlowDto {
  id: number;
  workflowId: number;
  domainEntityTypeName: string;
  domainEntityId: number;
  stepNumber: number;
  workflowStepId: number;
  workflowAction: WorkflowAction | string;
  entityAction: EntityAction | string;
  entityJson: string;
  creationDate: string;
  lastModifiedDate: string;
  actorId: string;
  creatorId: string;
  systemType: SystemType;
  relatedSystemId: number;
  creatorSystemType: SystemType;
  rejectionReason: RejectionReason;
}

export enum WorkflowAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED ",
}

export enum EntityAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  DECLINED = "DECLINED",
}

export enum RejectionReason {
  MISSING_ATTRIBUTE = "MISSING_ATTRIBUTE",
  FIELD_NOT_ENTERED_PROPERLY = "FIELD_NOT_ENTERED_PROPERLY ",
}
