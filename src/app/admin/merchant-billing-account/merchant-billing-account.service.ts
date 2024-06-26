import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { handleError } from '@helpers/handle-error';
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from 'rxjs/operators';
import { MerchantBillingAccount } from "./merchant-billing-account.model";

@Injectable({
  providedIn: 'root'
})
export class MerchantBillingAccountService {

  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}`;
  }

  getBillingAccount(
    merchantId: number,
  ): Observable<BaseResponse<MerchantBillingAccount>> {
    return this.http
      .get<BaseResponse<MerchantBillingAccount>>(`${this.apiUrl}/merchant-service/merchant/${merchantId}/billing`)
      .pipe(catchError(handleError));
  }
}
