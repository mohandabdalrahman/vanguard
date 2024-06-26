import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { MasterMerchant } from "./master-merchant.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class MasterMerchantService {
  baseUrl = `${environment.baseUrl}/merchant-service/master-merchant`;

  constructor(private http: HttpClient) {}

  getMasterMerchants(
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<MasterMerchant>> {
    return this.http
      .get<BaseResponse<MasterMerchant>>(`${this.baseUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  getMasterMerchantById(masterMerchantId: number): Observable<MasterMerchant> {
    return this.http
      .get<MasterMerchant>(`${this.baseUrl}/${masterMerchantId}`)
      .pipe(catchError(handleError));
  }

  deleteMasterMerchant(masterMerchantId: number): Observable<MasterMerchant> {
    return this.http
      .delete<MasterMerchant>(`${this.baseUrl}/${masterMerchantId}`)
      .pipe(catchError(handleError));
  }

  createMasterMerchant(
    masterMerchant: MasterMerchant
  ): Observable<MasterMerchant> {
    return this.http
      .post<MasterMerchant>(`${this.baseUrl}`, masterMerchant)
      .pipe(catchError(handleError));
  }

  updateMasterMerchant(
    masterMerchantId: number,
    masterMerchant: MasterMerchant
  ): Observable<MasterMerchant> {
    return this.http
      .put<MasterMerchant>(
        `${this.baseUrl}/${masterMerchantId}`,
        masterMerchant
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.baseUrl}/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
