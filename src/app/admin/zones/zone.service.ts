import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { Zone } from "./zone.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class ZoneService {
  apiUrl: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/country`;
    this.workFlowUrl = `${environment.baseUrl}/lookup-service/zone`;
  }

  getCityZones(
    countryId: number,
    cityId: number,
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<Zone>> {
    return this.http
      .get<BaseResponse<Zone>>(
        `${this.apiUrl}/${countryId}/city/${cityId}/zone`,
        {
          params: {
            ...searchObj,
            ...(pageNo && { pageNo }),
            ...(pageSize && { pageSize }),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  getZones(
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<Zone>> {
    return this.http
      .get<BaseResponse<Zone>>(`${this.workFlowUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  createZone(countryId: number, cityId: number, zone: Zone): Observable<Zone> {
    return this.http
      .post<Zone>(`${this.apiUrl}/${countryId}/city/${cityId}/zone`, zone)
      .pipe(catchError(handleError));
  }

  updateZone(
    countryId: number,
    cityId: number,
    zoneId: number,
    zone: Zone
  ): Observable<Zone> {
    return this.http
      .put<Zone>(
        `${this.apiUrl}/${countryId}/city/${cityId}/zone/${zoneId}`,
        zone
      )
      .pipe(catchError(handleError));
  }

  getZone(countryId: number, cityId: number, zoneId: number): Observable<Zone> {
    return this.http
      .get<Zone>(`${this.apiUrl}/${countryId}/city/${cityId}/zone/${zoneId}`)
      .pipe(catchError(handleError));
  }

  deleteZone(
    countryId: number,
    cityId: number,
    zoneId: number
  ): Observable<Zone> {
    return this.http
      .delete<Zone>(`${this.apiUrl}/${countryId}/city/${cityId}/zone/${zoneId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.workFlowUrl}/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
