import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseResponse } from "@models/response.model";
import { UserSearchObj } from "@models/user.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { MerchantUser } from "./merchant-user.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class MerchantUserService {
  apiUrl: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-user-service/merchant`;
    this.workFlowUrl = `${environment.baseUrl}/merchant-user-service/user`;
  }

  getMerchantUsers(
    MerchantId: number,
    searchObj?: UserSearchObj,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<MerchantUser>> {
    return this.http
      .get<BaseResponse<MerchantUser>>(`${this.apiUrl}/${MerchantId}/user`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(sortDirection && { sortDirection }),
          ...(sortBy && { sortBy }),
        },
      })
      .pipe(catchError(handleError));
  }

  createMerchantUser(
    merchantId: number,
    merchantUser: MerchantUser
  ): Observable<MerchantUser> {
    return this.http
      .post<MerchantUser>(`${this.apiUrl}/${merchantId}/user`, merchantUser)
      .pipe(catchError(handleError));
  }

  updateMerchantUser(
    merchantId: number,
    merchantUserId: number,
    merchantUser: MerchantUser
  ): Observable<MerchantUser> {
    return this.http
      .put<MerchantUser>(
        `${this.apiUrl}/${merchantId}/user/${merchantUserId}`,
        merchantUser
      )
      .pipe(catchError(handleError));
  }

  getMerchantUser(
    merchantId: number,
    merchantUserId: number
  ): Observable<MerchantUser> {
    return this.http
      .get<MerchantUser>(`${this.apiUrl}/${merchantId}/user/${merchantUserId}`)
      .pipe(catchError(handleError));
  }

  deleteMerchantUser(
    merchantId: number,
    merchantUserId: number
  ): Observable<MerchantUser> {
    return this.http
      .delete<MerchantUser>(
        `${this.apiUrl}/${merchantId}/user/${merchantUserId}`
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.workFlowUrl}/updateWorkflowStatus/${workFlowLogId}`,
        workFlow,
        {
          params: {
            ...(merchantId && { merchantId }),
          },
        }
      )
      .pipe(catchError(handleError));
  }
}
