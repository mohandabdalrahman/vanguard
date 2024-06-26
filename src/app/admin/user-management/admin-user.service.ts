import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { User, UserSearchObj } from "@models/user.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class AdminUserService {
  apiUrl: string;
  roleApiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/admin-user-service/user`;
    this.roleApiUrl = `${environment.baseUrl}/security-service/role`;
  }

  getAdminUsers(
    searchObj?: UserSearchObj,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<User>> {
    return this.http
      .get<BaseResponse<User>>(`${this.apiUrl}`, {
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

  createAdminUser(adminUser: User): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}`, adminUser)
      .pipe(catchError(handleError));
  }

  updateAdminUser(adminUserId: number, adminUser: User): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/${adminUserId}`, adminUser)
      .pipe(catchError(handleError));
  }

  getAdminUser(adminUserId: number): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${adminUserId}`)
      .pipe(catchError(handleError));
  }

  deleteAdminUser(adminUserId: number): Observable<User> {
    return this.http
      .delete<User>(`${this.apiUrl}/${adminUserId}`)
      .pipe(catchError(handleError));
  }

  getUserRoles(searchObj?: any): Observable<BaseResponse<any>> {
    return this.http
      .get<BaseResponse<any>>(this.roleApiUrl, { params: { ...searchObj } })
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/updateWorkflowStatus/${workFlowLogId}`,
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
