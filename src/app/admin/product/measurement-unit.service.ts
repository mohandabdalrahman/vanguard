import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { MeasurementUnit } from "./measurement-unit.model";

@Injectable({
  providedIn: "root",
})
export class MeasurementUnitService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/measurement-unit`;
  }

  getMeasurementUnits(
    searchObj?: any
  ): Observable<BaseResponse<MeasurementUnit>> {
    return this.http
      .get<BaseResponse<MeasurementUnit>>(`${this.apiUrl}`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }
  getMeasurementUnit(unitId: number): Observable<MeasurementUnit> {
    return this.http
      .get<MeasurementUnit>(`${this.apiUrl}/${unitId}`)
      .pipe(catchError(handleError));
  }
}
