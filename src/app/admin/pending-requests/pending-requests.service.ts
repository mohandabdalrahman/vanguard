import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { HttpClient } from "@angular/common/http";
import { SystemType } from "@models/system-type";
import { EntityAction, WorkFlowDto } from "@models/work-flow.model";
import { PendingLogsResponseDTO } from "@models/pending-requests.model";
import { Merchant } from "../merchants/merchant.model";
import { Corporate } from "../corporates/corporate.model";

@Injectable({
  providedIn: "root",
})
export class PendingRequestsService {
  private pendingLogsSource = new BehaviorSubject<WorkFlowDto[]>([]);
  pendingLogs$ = this.pendingLogsSource.asObservable();
  private merchantsSource = new BehaviorSubject<Merchant[]>([]);
  merchants$ = this.merchantsSource.asObservable();
  private corporatesSource = new BehaviorSubject<Corporate[]>([]);
  corporates$ = this.corporatesSource.asObservable();
  apiUrl: string;
  merchants: Merchant[] = [];
  corporates: Corporate[] = [];

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/workflow-service/workflow/pending`;
  }

  getPendingRequests(
    relatedSystemId?: number,
    systemType?: SystemType,
    requestType?: EntityAction
  ): Observable<PendingLogsResponseDTO> {
    return this.http
      .get<PendingLogsResponseDTO>(`${this.apiUrl}`, {
        params: {
          ...{ rejected: requestType === EntityAction.DECLINED },
          ...(relatedSystemId && { relatedSystemId }),
          ...(systemType && { systemType }),
          ...(requestType && {
            requestType:
              requestType === EntityAction.DECLINED ? "" : requestType,
          }),
        },
      })
      .pipe(catchError(handleError));
  }

  onPendingLogsChange(pendingLogs: WorkFlowDto[]) {
    this.pendingLogsSource.next(pendingLogs);
  }

  onMerchantsChange(merchants: Merchant[]) {
    this.merchants = merchants;
    // this.merchantsSource.next(merchants);
  }

  onCorporatesChange(corporates: Corporate[]) {
    this.corporates = corporates;
    // this.corporatesSource.next(corporates);
  }
}
