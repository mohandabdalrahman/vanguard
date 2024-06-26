import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { PendingRequestsService } from "./pending-requests.service";
import { PendingLogsResponseDTO } from "@models/pending-requests.model";

@Injectable({
  providedIn: "root",
})
export class PendingRequestsResolver
  implements Resolve<PendingLogsResponseDTO>
{
  constructor(private pendingRequestsService: PendingRequestsService) {}

  resolve(): Observable<PendingLogsResponseDTO> {
    return this.pendingRequestsService.getPendingRequests();
  }
}
