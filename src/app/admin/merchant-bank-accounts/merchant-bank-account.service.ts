import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import {
  MerchantBankAccount,
  MerchantBankAccountSearch,
} from "./merchant-bank-account.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class MerchantBankAccountService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-service/merchant`;
  }

  getMerchantBankAccounts(
    MerchantId: number,
    searchObj?: MerchantBankAccountSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<MerchantBankAccount>> {
    return this.http
      .get<BaseResponse<MerchantBankAccount>>(
        `${this.apiUrl}/${MerchantId}/bank`,
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

  createMerchantBankAccount(
    merchantId: number,
    merchantBankAccount: MerchantBankAccount
  ): Observable<MerchantBankAccount> {
    return this.http
      .post<MerchantBankAccount>(
        `${this.apiUrl}/${merchantId}/bank`,
        merchantBankAccount
      )
      .pipe(catchError(handleError));
  }

  updateMerchantBankAccount(
    merchantId: number,
    merchantBankAccountId: number,
    merchantBankAccount: MerchantBankAccount
  ): Observable<MerchantBankAccount> {
    return this.http
      .put<MerchantBankAccount>(
        `${this.apiUrl}/${merchantId}/bank/${merchantBankAccountId}`,
        merchantBankAccount
      )
      .pipe(catchError(handleError));
  }

  getMerchantBankAccountById(
    merchantId: number,
    merchantBankAccountId: number
  ): Observable<MerchantBankAccount> {
    return this.http
      .get<MerchantBankAccount>(
        `${this.apiUrl}/${merchantId}/bank/${merchantBankAccountId}`
      )
      .pipe(catchError(handleError));
  }

  deleteMerchantBankAccount(
    merchantId: number,
    merchantBankAccountId: number
  ): Observable<MerchantBankAccount> {
    return this.http
      .delete<MerchantBankAccount>(
        `${this.apiUrl}/${merchantId}/bank/${merchantBankAccountId}`
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${merchantId}/bank/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
