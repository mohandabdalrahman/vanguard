import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { TopUp } from "@models/topup.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { CorporatesTopUpsSearch } from "../corporate-bills/corporate-bills.model";
import {
  Corporate,
  CorporateLevel,
  CorporateOusSearch,
  CorporateSearch,
  MasterCorporate,
} from "./corporate.model";
import { WorkFlowDto } from "@models/work-flow.model";
import { CorporateOu } from "../organizational-chart/corporate-ou.model";

@Injectable({
  providedIn: "root",
})
export class CorporateService {
  apiUrl: string;
  corporateServiceUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service`;
    this.corporateServiceUrl = `${environment.baseUrl}/corporate-service`;
  }

  getCorporateOus(
    corporateId: number,
    searchObj?: CorporateOusSearch,
    pageNo?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection: string = "DESC",
  ): Observable<BaseResponse<CorporateOu>>{
    return this.http
    .get<BaseResponse<CorporateOu>>(`${this.apiUrl}/corporate/${corporateId}/ou/list`, {
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

  getCorporates(
    searchObj?: CorporateSearch,
    includeBillingAccounts?: boolean,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "ASC",
    sortBy?: string
  ): Observable<BaseResponse<Corporate>> {
    return this.http
      .get<BaseResponse<Corporate>>(`${this.apiUrl}/corporate`, {
        params: {
          ...searchObj,
          ...(includeBillingAccounts && {includeBillingAccounts}),
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(sortDirection && { sortDirection }),
          ...(sortBy && { sortBy }),
        },
      })
      .pipe(catchError(handleError));
  }

  createCorporate(corporate: Corporate): Observable<Corporate> {
    return this.http
      .post<Corporate>(`${this.apiUrl}/corporate`, corporate)
      .pipe(catchError(handleError));
  }

  updateCorporate(
    corporateId: number,
    corporate: Corporate
  ): Observable<Corporate> {
    return this.http
      .put<Corporate>(`${this.apiUrl}/corporate/${corporateId}`, corporate)
      .pipe(catchError(handleError));
  }

  getCorporate(corporateId: number): Observable<Corporate> {
    return this.http
      .get<Corporate>(`${this.apiUrl}/corporate/${corporateId}`)
      .pipe(catchError(handleError));
  }

  deleteCorporate(corporateId: number): Observable<Corporate> {
    return this.http
      .delete<Corporate>(`${this.apiUrl}/corporate/${corporateId}`)
      .pipe(catchError(handleError));
  }

  getCorporateLevels(
    searchObj?: any
  ): Observable<BaseResponse<CorporateLevel>> {
    return this.http
      .get<BaseResponse<CorporateLevel>>(`${this.corporateServiceUrl}/corporate-level`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }

  getCorporateLevel(corporateLevelId: number): Observable<CorporateLevel> {
    return this.http
      .get<CorporateLevel>(`${this.corporateServiceUrl}/corporate-level/${corporateLevelId}`)
      .pipe(catchError(handleError));
  }



  getMasterCorporates(
    searchObj?: any
  ): Observable<BaseResponse<MasterCorporate>> {
    return this.http
      .get<BaseResponse<MasterCorporate>>(`${this.corporateServiceUrl}/master-corporate`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }

  getMasterCorporate(masterCorporateId: number): Observable<MasterCorporate> {
    return this.http
      .get<MasterCorporate>(
        `${this.corporateServiceUrl}/master-corporate/${masterCorporateId}`
      )
      .pipe(catchError(handleError));
  }

  getCorporatesTopUps(
    searchObj?: CorporatesTopUpsSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection?: string,
    sortBy?: string
  ): Observable<BaseResponse<TopUp>> {
    return this.http
      .get<BaseResponse<TopUp>>(`${this.corporateServiceUrl}/corporate/topups`, {
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

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/corporate/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
