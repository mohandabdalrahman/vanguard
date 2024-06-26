import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import {
  CorporateOuAdmins,
  UnassignedUser,
  User,
  UserCount,
  UserSearchObj,
} from "app/models/user.model";
import { Observable, Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import { WorkFlowDto } from "@models/work-flow.model";
import { RoleTag } from "../user-roles/user-role.model";
import { Admin } from "../organizational-chart/corporate-ou.model";

@Injectable({
  providedIn: "root",
})
export class CorporateUserService {
  apiUrl: string;
  workFlowUrl: string;
  private corporateUserSource = new Subject();
  corporateUser$ = this.corporateUserSource.asObservable() as Observable<Admin>;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
    this.workFlowUrl = `${environment.baseUrl}/corporate-orchestration-service/user`;
  }

  getCorporateUsers(
    corporateId: number,
    searchObj?: UserSearchObj,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<User>> {
    return this.http
      .get<BaseResponse<User>>(`${this.apiUrl}/${corporateId}/user`, {
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

  getCorporatesUsers(
    searchObj?: UserSearchObj,
    pageNo?: number,
    pageSize?: number,
    sortDirection?: string,
    sortBy?: string
  ): Observable<BaseResponse<User>> {
    return this.http
      .get<BaseResponse<User>>(
        `${environment.baseUrl}/corporate-user-service/user`,
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

  getCorporatesUsersCount(
    corporateId: number,
    searchObj?: UserSearchObj
  ): Observable<UserCount[]> {
    return this.http
      .get<UserCount[]>(
        `${environment.baseUrl}/corporate-user-service/corporate/${corporateId}/user/count`,
        {
          params: {
            ...searchObj,
          },
        }
      )
      .pipe(catchError(handleError));
  }

  getCorporateOuAdmins(
    corporateId: number,
    roleTag: RoleTag,
    searchObj: { ouIds: number[]; suspended?: boolean }
  ): Observable<CorporateOuAdmins> {
    return this.http
      .get<CorporateOuAdmins>(
        `${this.apiUrl}/${corporateId}/role-tag/${roleTag}/user`,
        {
          params: {
            ...searchObj,
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporateUser(
    corporateId: number,
    corporateUser: User
  ): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/${corporateId}/user`, corporateUser)
      .pipe(catchError(handleError));
  }

  createCorporateUsersList(
    corporateId: number,
    usersList: Admin[]
  ): Observable<Admin[]> {
    return this.http
      .post<Admin[]>(`${this.apiUrl}/${corporateId}/user/list`, usersList)
      .pipe(catchError(handleError));
  }

  updateCorporateUser(
    corporateId: number,
    corporateUserId: number,
    corporateUser: User
  ): Observable<User> {
    return this.http
      .put<User>(
        `${this.apiUrl}/${corporateId}/user/${corporateUserId}`,
        corporateUser
      )
      .pipe(catchError(handleError));
  }

  getCorporateUser(
    corporateId: number,
    corporateUserId: number
  ): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${corporateId}/user/${corporateUserId}`)
      .pipe(catchError(handleError));
  }

  deleteCorporateUser(
    corporateId: number,
    corporateUserId: number
  ): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${corporateId}/user/${corporateUserId}`)
      .pipe(catchError(handleError));
  }

  // get unassigned user
  getUnassignedUsers(
    corporateId: number,
    searchObj?: any,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = 'DESC',
    sortBy?: string
  ): Observable<BaseResponse<UnassignedUser>> {
    return this.http
      .get<BaseResponse<UnassignedUser>>(
        `${this.apiUrl}/${corporateId}/user/unassigned`,
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

  onCreateCorporateUser(user: Admin) {
    this.corporateUserSource.next(user);
  }
}
