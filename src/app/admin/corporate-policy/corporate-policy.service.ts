import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {BaseResponse} from "@models/response.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {
  CorporatePolicy,
  CorporatePolicySearch,
  PolicyUsers,
} from "./corporate-policy.model";
import {WorkFlowDto} from "@models/work-flow.model";
import {CardHolder} from "@models/card-holder.model";
import {CorporateVehicle} from "../corporate-vehicle/corporate-vehicle.model";

// import { TransactionSearch } from "@models/transaction.model";

@Injectable({
  providedIn: "root",
})
export class CorporatePolicyService {
  apiUrl: string;
  apiUrl2: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
    this.workFlowUrl = `${environment.baseUrl}/corporate-orchestration-service/policy`;

  }

  getCorporatePolicies(
    corporateId: number,
    searchObj?: CorporatePolicySearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<CorporatePolicy>> {
    return this.http
      .get<BaseResponse<CorporatePolicy>>(
        `${this.apiUrl}/${corporateId}/policy`,
        {
          params: {
            ...searchObj,
            ...(pageNo && {pageNo}),
            ...(pageSize && {pageSize}),
            ...(sortDirection && {sortDirection}),
            ...(sortBy && {sortBy}),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporatePolicy(
    corporateId: number,
    corporatePolicy: CorporatePolicy
  ): Observable<CorporatePolicy> {
    return this.http
      .post<CorporatePolicy>(
        `${this.apiUrl}/${corporateId}/policy`,
        corporatePolicy
      )
      .pipe(catchError(handleError));
  }

  updateCorporatePolicy(
    corporateId: number,
    corporatePolicyId: number,
    corporatePolicy: CorporatePolicy
  ): Observable<CorporatePolicy> {
    return this.http
      .put<CorporatePolicy>(
        `${this.apiUrl}/${corporateId}/policy/${corporatePolicyId}`, corporatePolicy)
      .pipe(catchError(handleError));
  }

  getCorporatePolicy(
    corporateId: number,
    corporatePolicyId: number
  ): Observable<CorporatePolicy> {

    return this.http
      .get<CorporatePolicy>(
        `${this.apiUrl}/${corporateId}/policy/${corporatePolicyId}`
      )
      .pipe(catchError(handleError));
  }

  deleteCorporatePolicy(
    corporateId: number,
    corporatePolicyId: number
  ): Observable<CorporatePolicy> {
    return this.http
      .delete<CorporatePolicy>(
        `${this.apiUrl}/${corporateId}/policy/${corporatePolicyId}`
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.workFlowUrl}/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }

  GetPolicyUsers(corporateId: number,
                 ouId: number,
                 searchObj?,
                 pageNo?: number,
                 pageSize?: number,
                 sortDirection: string = "DESC",
                 sortBy?: string
  ): Observable<BaseResponse<PolicyUsers>> {
    return this.http.get<BaseResponse<any>>(`${this.apiUrl}/${corporateId}/ou/${ouId}/asset-policy`, {
      params: {
        ...(corporateId && {corporateId}),
        ...searchObj,
        ...(pageNo && {pageNo}),
        ...(pageSize && {pageSize}),
        ...(sortDirection && {sortDirection}),
        ...(sortBy && {sortBy}),

      },
    })
  }

  getUsers(corporateId: number, searchObj?): Observable<BaseResponse<any>> {

    return this.http.get<BaseResponse<CardHolder>>(`${this.apiUrl}/${corporateId}/asset/user`,
      {
        params: {
          ...searchObj
        }
      })
  }

  GetVehicleDetail(corporateId: number, searchObj?): Observable<BaseResponse<any>> {

    return this.http.get<BaseResponse<CorporateVehicle>>(`${this.apiUrl}/${corporateId}/asset/vehicle`,
      {
        params: {
          ...searchObj
        }
      })
  }


}
