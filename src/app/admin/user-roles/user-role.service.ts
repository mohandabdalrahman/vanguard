import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { SecurityProfile, UserRole } from "./user-role.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class UserRolesService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/security-service`;
  }

  getUserRoles(
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<UserRole>> {
    return this.http
      .get<BaseResponse<UserRole>>(`${this.apiUrl}/role`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  getUserRoleById(roleId: number): Observable<UserRole> {
    return this.http
      .get<UserRole>(`${this.apiUrl}/role/${roleId}`)
      .pipe(catchError(handleError));
  }

  deleteUserRole(roleId: number): Observable<UserRole> {
    return this.http
      .delete<UserRole>(`${this.apiUrl}/role/${roleId}`)
      .pipe(catchError(handleError));
  }

  getSecurityProfiles(
    searchObj?: any
  ): Observable<BaseResponse<SecurityProfile>> {
    return this.http
      .get<BaseResponse<SecurityProfile>>(`${this.apiUrl}/security-profile`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }

  createUserRole(userRole: UserRole): Observable<UserRole> {
    return this.http
      .post<UserRole>(`${this.apiUrl}/role`, userRole)
      .pipe(catchError(handleError));
  }

  updateUserRole(UserRoleId: number, userRole: UserRole) {
    return this.http
      .put<UserRole>(`${this.apiUrl}/role/${UserRoleId}`, userRole)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/role/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
