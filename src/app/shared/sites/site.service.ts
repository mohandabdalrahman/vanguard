import { MerchantSite, MerchantSiteSearchObj } from "./site.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class SiteService {
  baseUrl = environment.baseUrl;
  merchantUrl = `${environment.baseUrl}/merchant-service/merchant`;

  constructor(private http: HttpClient) {
  }

  getMerchantSiteList(
    merchantId,
    searchObj?,
    pageNo?: number,
    pageSize?: number,
    includeBillingAccounts?: boolean,
  ): Observable<BaseResponse<MerchantSite>> {
    return this.http
    .get<BaseResponse<MerchantSite>>(`${this.merchantUrl}/${merchantId}/site`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(includeBillingAccounts && {includeBillingAccounts}),
        },
      })
      .pipe(catchError(handleError));
  }

  getSiteList(
    searchObj?,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<MerchantSite>> {
    return this.http
      .get<BaseResponse<MerchantSite>>(`${this.baseUrl}/merchant-service/site`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  getMerchantProducts(merchantId, searchObj?) {
    return this.http
      .get(`${this.baseUrl}/product-service/merchant/${merchantId}/product`, {
        params: {
          ...searchObj,
        },
      })
      .pipe(catchError(handleError));
  }

  getContactTypes() {
    return this.http
      .get(`${this.baseUrl}/lookup-service/contact-type`)
      .pipe(catchError(handleError));
  }

  createMerchantSite(
    merchantId: number,
    merchantSiteObj: MerchantSite
  ): Observable<MerchantSite> {
    return this.http
    .post<MerchantSite>(`${this.merchantUrl}/${merchantId}/site`, merchantSiteObj)
      .pipe(catchError(handleError));
  }

  updateMerchantSite(
    merchantId: number,
    merchantSiteId: number,
    merchantSiteObj: MerchantSite
  ): Observable<MerchantSite> {
    return this.http
      .put<MerchantSite>(
        `${this.merchantUrl}/${merchantId}/site/${merchantSiteId}`,
        merchantSiteObj
      )
      .pipe(catchError(handleError));
  }

  getMerchantSite(
    merchantId: number,
    siteId: number,
    includeBillingAccounts?: boolean,
    searchObj?: MerchantSiteSearchObj,
  ): Observable<MerchantSite> {
    return this.http
      .get<MerchantSite>(
        `${this.merchantUrl}/${merchantId}/site/${siteId}?includeContacts=true`,
        {
          params: {
            ...(includeBillingAccounts && {includeBillingAccounts}),
            ...searchObj,
          },
        }
      )
      .pipe(catchError(handleError));
  }

  deleteMerchantSite(
    merchantId: number,
    siteId: number
  ): Observable<MerchantSite> {
    return this.http
      .delete<MerchantSite>(`${this.merchantUrl}/${merchantId}/site/${siteId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.merchantUrl}/${merchantId}/site/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
