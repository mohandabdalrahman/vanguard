import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import { TopUpReport} from "@models/topup.model";
import {environment} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TopUpService {
  apiUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = `${environment.baseUrl}/reporting-service`;
  }

  getTopUpLogs(corporateId: number, searchObj?: { fromDate: number, toDate: number },
               pageNo?: number,
               pageSize?: number,
               sortDirection?: string,
               sortBy?: string): Observable<TopUpReport> {
    return this.http
      .get<TopUpReport>(`${this.apiUrl}/corporate/${corporateId}/topup/logs`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
          ...(sortDirection && {sortDirection}),
          ...(sortBy && {sortBy}),
        }
      })
      .pipe(catchError(handleError));
  }
}
