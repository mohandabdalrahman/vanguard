import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {AlertType, CorporateAlert, GenericAlert, GenericAlertSearch, GenericAlertType} from "./corporate-alert.model";
import {BaseResponse} from "@models/response.model";

@Injectable({
  providedIn: "root",
})
export class CorporateAlertService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/alert-service/corporate`;
  }

  getCorporateAlerts(
    corporateId: number,
    ouIds: number | number [],
    alertType: AlertType,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<CorporateAlert>> {
    return this.http
      .get<BaseResponse<CorporateAlert>>(
        `${this.apiUrl}/${corporateId}/alert`,
        {
          params: {
            alertType,
            ...(ouIds && {ouIds}),
            ...(pageNo && {pageNo}),
            ...(pageSize && {pageSize}),
            ...(sortDirection && {sortDirection}),
            ...(sortBy && {sortBy}),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  getCorporatesAlerts(
    alertType: AlertType,
    ouIds: number | number [],
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<CorporateAlert>> {
    return this.http
      .get<BaseResponse<CorporateAlert>>(`${this.apiUrl}/alert`, {
        params: {
          alertType,
          ...(ouIds && {ouIds}),
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  getLicenseExpiryAlert(
    corporateIds: number [] = [],
    ouIds: number | number [],
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy: string = "id",
    plateNumber?: number,
  ): Observable<BaseResponse<CorporateAlert>> {
    return this.http
      .get<BaseResponse<CorporateAlert>>(`${this.apiUrl}/alert/license`, {
        params: {
          corporateIds,
          ...(ouIds && {ouIds}),
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
          ...(sortDirection && {sortDirection}),
          ...(sortBy && {sortBy}),
          ...(plateNumber && {plateNumber}),
        },
      })
      .pipe(catchError(handleError));

  }


  getGenericAlerts(
    genericAlertSearch: GenericAlertSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<GenericAlert>> {
    return this.http
      .get<BaseResponse<GenericAlert>>(`${environment.baseUrl}/alert-service/generic/alert`, {
        params: {
          ...genericAlertSearch,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
          ...(sortDirection && {sortDirection}),
          ...(sortBy && {sortBy}),
        },
      })
      .pipe(catchError(handleError));
  }

  getGenericAlertTypes(): Observable<GenericAlertType[]> {
    return this.http
      .get<GenericAlertType[]>(`${environment.baseUrl}/alert-service/generic/alert/type`,)
      .pipe(catchError(handleError));
  }

}
