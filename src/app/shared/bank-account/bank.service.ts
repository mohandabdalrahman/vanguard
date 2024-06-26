import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BankAdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { Bank } from "./bank-account.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class BankService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/bank`;
  }

  getBanks(
    searchObj?: BankAdvanceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection?: string,
    sortBy?: string
  ): Observable<BaseResponse<Bank>> {
    return this.http
      .get<BaseResponse<Bank>>(`${this.apiUrl}`, {
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

  createBank(bank: Bank): Observable<Bank> {
    return this.http
      .post<Bank>(`${this.apiUrl}`, bank)
      .pipe(catchError(handleError));
  }

  updateBank(bankId: number, bank: Bank): Observable<Bank> {
    return this.http
      .put<Bank>(`${this.apiUrl}/${bankId}`, bank)
      .pipe(catchError(handleError));
  }

  getBank(bankId: number): Observable<Bank> {
    return this.http
      .get<Bank>(`${this.apiUrl}/${bankId}`)
      .pipe(catchError(handleError));
  }

  deleteBank(bankId: number): Observable<Bank> {
    return this.http
      .delete<Bank>(`${this.apiUrl}/${bankId}`)
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
