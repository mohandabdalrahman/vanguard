import { WorkFlowDto } from "@models/work-flow.model";

export interface PendingLogsResponseDTO {
  pendingLogs: WorkFlowDto[];
  resourceCount: any;
}
