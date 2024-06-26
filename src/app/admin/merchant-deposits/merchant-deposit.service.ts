import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";
import {Observable} from "rxjs";
import {BaseResponse} from "../../models/response.model";
import {catchError} from "rxjs/operators";
import {handleError} from "../../helpers/handle-error";
import {MerchantDeposit, MerchantDepositSearch} from "./merchant-deposits.model";

@Injectable({
  providedIn: 'root'
})
export class MerchantDepositService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-service/merchant`;
  }

  getMerchantDeposits(
    merchantId: number,
    searchObj?: MerchantDepositSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = 'DESC',
    sortBy?: string
  ): Observable<BaseResponse<MerchantDeposit>> {
    return this.http
      .get<BaseResponse<MerchantDeposit>>(`${this.apiUrl}/${merchantId}/deposit`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
          ...(sortDirection && {sortDirection}),
          ...(sortBy && {sortBy}),
        },
      })
      .pipe(catchError(handleError));
  }

  createMerchantDeposit(
    merchantDeposit: MerchantDeposit,
    siteId?: number
  ): Observable<MerchantDeposit> {
    return this.http
      .post<MerchantDeposit>(`${this.apiUrl}/${merchantDeposit.merchantId}/deposit`,
      merchantDeposit,{
        params: {
          ...(siteId && {siteId}),
        }
      })
      .pipe(catchError(handleError));
  }
}
