import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseResponse } from "@models/response.model";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { CorporateBill, CorporateBillSearch } from "./corporate-bills.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateBillsService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/invoice-service/corporate`;
  }

  getCorporateBills(
    corporateId: number,
    searchObj?: CorporateBillSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<CorporateBill>> {
    return this.http
      .get<BaseResponse<CorporateBill>>(
        `${this.apiUrl}/${corporateId}/statement`,
        {
          params: {
            ...searchObj,
            ...(pageNo && { pageNo }),
            ...(pageSize && { pageSize }),
            ...(sortDirection && { sortDirection }),
            ...(sortBy && { sortBy }),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  getCorporatesBills(
    searchObj?: CorporateBillSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<CorporateBill>> {
    return this.http
      .get<BaseResponse<CorporateBill>>(`${this.apiUrl}/statement`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  getCorporateBill(
    corporateId: number,
    billId: number
  ): Observable<CorporateBill> {
    return this.http
      .get<CorporateBill>(`${this.apiUrl}/${corporateId}/statement/${billId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    corporateId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${corporateId}/billing/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
