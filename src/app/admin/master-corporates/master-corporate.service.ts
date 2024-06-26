import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { MasterCorporate } from "./master-corporate.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class MasterCorporateService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-service/master-corporate`;
  }

  getMasterCorporates(
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<MasterCorporate>> {
    return this.http
      .get<BaseResponse<MasterCorporate>>(`${this.apiUrl}`, {
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

  getMasterCorporateById(
    masterCorporateId: number
  ): Observable<MasterCorporate> {
    return this.http
      .get<MasterCorporate>(`${this.apiUrl}/${masterCorporateId}`)
      .pipe(catchError(handleError));
  }

  deleteMasterCorporate(
    masterCorporateId: number
  ): Observable<MasterCorporate> {
    return this.http
      .delete<MasterCorporate>(`${this.apiUrl}/${masterCorporateId}`)
      .pipe(catchError(handleError));
  }

  createMasterCorporate(
    masterCorporate: MasterCorporate
  ): Observable<MasterCorporate> {
    return this.http
      .post<MasterCorporate>(`${this.apiUrl}`, masterCorporate)
      .pipe(catchError(handleError));
  }

  updateMasterCorporate(
    masterCorporateId: number,
    masterCorporate: MasterCorporate
  ): Observable<MasterCorporate> {
    return this.http
      .put<MasterCorporate>(
        `${this.apiUrl}/${masterCorporateId}`,
        masterCorporate
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
