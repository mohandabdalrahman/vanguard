import { WorkFlowDto } from "@models/work-flow.model";

export interface PendingRequestCard extends WorkFlowDto {
  requester: string;
  systemTypeName: string;
  userId: number;
  actionType: string;
  date: string;
  status: boolean;
}

export interface differProps {
  oldValue: string;
  newValue: string;
}
