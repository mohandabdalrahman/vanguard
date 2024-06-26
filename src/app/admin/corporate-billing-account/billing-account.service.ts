

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from '@helpers/handle-error';
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from 'rxjs/operators';
import { BillingAccount, Topup } from "./billing-account.model";

@Injectable({
  providedIn: "root",
})
export class BillingAccountService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}`;
  }


    getAccountTypes(){
      return this.http
      .get<BaseResponse<BillingAccount>>(`${this.apiUrl}/corporate-service/account-type`)
      .pipe(catchError(handleError));
    }

    getBillingAccount(
      corporateId: number,
    ): Observable<BaseResponse<BillingAccount>> {
      return this.http
        .get<BaseResponse<BillingAccount>>(`${this.apiUrl}/corporate-service/corporate/${corporateId}/billing`)
        .pipe(catchError(handleError));
    }

  
    createBillingAccount(corporateId: number, billingAccount: BillingAccount): Observable<BillingAccount> {
        return this.http
          .post<BillingAccount>(`${this.apiUrl}/corporate-service/corporate/${corporateId}/billing`, billingAccount)
          .pipe(catchError(handleError));
    }

    updateBillingAccount(
        corporateId: number,
        billingAccount: BillingAccount
      ): Observable<BillingAccount> {
        return this.http
          .put<BillingAccount>(`${this.apiUrl}/corporate-service/corporate/${corporateId}/billing`, billingAccount)
          .pipe(catchError(handleError));
    }

    updateTopUp(corporateId: number, topUp : Topup) :  Observable<Topup> {
        return this.http
          .post<Topup>(`${this.apiUrl}/corporate-service/corporate/${corporateId}/billing/top-up`, topUp)
          .pipe(catchError(handleError));
    }

    getAccountTypesById(accountTypeId){
      return this.http
      .get<BaseResponse<BillingAccount>>(`${this.apiUrl}/corporate-service/account-type/${accountTypeId}`)
      .pipe(catchError(handleError));

    }
  
}
