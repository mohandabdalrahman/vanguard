import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { handleError } from "@helpers/handle-error";
import { City } from "./city.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CityService {
  apiUrl: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/country`;
    this.workFlowUrl = `${environment.baseUrl}/lookup-service/city`;
  }

  getCities(
    countryId: number,
    searchObj?: AdvanceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<City>> {
    return this.http
      .get<BaseResponse<City>>(`${this.apiUrl}/${countryId}/city`, {
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

  createCity(countryId: number, city: City): Observable<City> {
    return this.http
      .post<City>(`${this.apiUrl}/${countryId}/city`, city)
      .pipe(catchError(handleError));
  }

  updateCity(countryId: number, cityId: number, city: City): Observable<City> {
    return this.http
      .put<City>(`${this.apiUrl}/${countryId}/city/${cityId}`, city)
      .pipe(catchError(handleError));
  }

  getCity(countryId: number, cityId: number): Observable<City> {
    return this.http
      .get<City>(`${this.apiUrl}/${countryId}/city/${cityId}`)
      .pipe(catchError(handleError));
  }

  deleteCity(countryId: number, cityId: number): Observable<City> {
    return this.http
      .delete<City>(`${this.apiUrl}/${countryId}/city/${cityId}`)
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
