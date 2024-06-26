import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {BaseResponse} from "@models/response.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {MasterSearch, Merchant} from "./merchant.model";
import {WorkFlowDto} from "@models/work-flow.model";
import { Otu, OtuSearchCriteriaDto } from "@models/otu.model";
import { Tips, TipsSearchCriteriaDto } from "@models/tips.model";

export type MerchantBalance = {
  merchantBalance: number;
  masterMerchantBalance: number;
}

@Injectable({
  providedIn: "root",
})
export class MerchantService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-service/merchant`;
  }

  getMerchants(
    searchObj?: MasterSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<Merchant>> {
    return this.http
      .get<BaseResponse<Merchant>>(`${this.apiUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  createMerchant(merchant: Merchant): Observable<Merchant> {
    return this.http
      .post<Merchant>(`${this.apiUrl}`, merchant)
      .pipe(catchError(handleError));
  }

  updateMerchant(merchantId: number, merchant: Merchant): Observable<Merchant> {
    return this.http
      .put<Merchant>(`${this.apiUrl}/${merchantId}`, merchant)
      .pipe(catchError(handleError));
  }

  getMerchant(merchantId: number): Observable<Merchant> {
    return this.http
      .get<Merchant>(`${this.apiUrl}/${merchantId}`)
      .pipe(catchError(handleError));
  }

  deleteMerchant(merchantId: number): Observable<Merchant> {
    return this.http
      .delete<Merchant>(`${this.apiUrl}/${merchantId}`)
      .pipe(catchError(handleError));
  }

  deleteOtu(merchantId:number,siteId:number, otuId: number) {
    return this.http
      .delete<Merchant>(`${this.apiUrl}/${merchantId}/site/${siteId}/otu/${otuId}`)
      .pipe(catchError(handleError));
  }

  getMerchantBankById(merchantId, bankAccountId) {
    return this.http
      .get(`${this.apiUrl}/${merchantId}/bank/${bankAccountId}`)
      .pipe(catchError(handleError));
  }

  getMerchantBanks(merchantId, searchObj?) {
    return this.http
      .get(`${this.apiUrl}/${merchantId}/bank`, {
        params: {...searchObj},
      })
      .pipe(catchError(handleError));
  }

  getMerchantBalance(merchantId): Observable<MerchantBalance> {
    return this.http
      .get<MerchantBalance>(`${this.apiUrl}/${merchantId}/balance`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }

  getMerchantOtus(searchObj: OtuSearchCriteriaDto,pageNo: number,
    pageSize: number): Observable<BaseResponse<Otu>> {
    return this.http
      .get<BaseResponse<Otu>>(`${this.apiUrl}/otu`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },

      })
      .pipe(catchError(handleError));
  }

  getTips(searchObj: TipsSearchCriteriaDto,pageNo: number,
    pageSize: number): Observable<BaseResponse<Tips>> {
    return this.http
      .get<BaseResponse<Tips>>(`${environment.baseUrl}/merchant-service/tips`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        }
      })
      .pipe(catchError(handleError));
  }
}
