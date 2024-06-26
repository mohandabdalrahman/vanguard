import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { environment } from "@environments/environment";
import { Country } from "./country.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CountryService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/country`;
  }

  getCountries(
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<Country>> {
    return this.http
      .get<BaseResponse<Country>>(`${this.apiUrl}`, {
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

  createCountry(country: Country): Observable<Country> {
    return this.http
      .post<Country>(`${this.apiUrl}`, country)
      .pipe(catchError(handleError));
  }

  updateCountry(countryId: number, country: Country): Observable<Country> {
    return this.http
      .put<Country>(`${this.apiUrl}/${countryId}`, country)
      .pipe(catchError(handleError));
  }

  getCountry(countryId: number): Observable<Country> {
    return this.http
      .get<Country>(`${this.apiUrl}/${countryId}`)
      .pipe(catchError(handleError));
  }

  deleteCountry(countryId: number): Observable<Country> {
    return this.http
      .delete<Country>(`${this.apiUrl}/${countryId}`)
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
