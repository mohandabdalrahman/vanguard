import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import {
  MerchantProduct,
  MerchantProductSearch,
} from "./merchant-product.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class MerchantProductService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/product-service`;
  }

  getMerchantProducts(
    MerchantId: number,
    searchObj?: MerchantProductSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<MerchantProduct>> {
    return this.http
      .get<BaseResponse<MerchantProduct>>(
        `${this.apiUrl}/merchant/${MerchantId}/product`,
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

  createMerchantProduct(
    merchantId: number,
    merchantProduct: MerchantProduct
  ): Observable<MerchantProduct> {
    return this.http
      .post<MerchantProduct>(
        `${this.apiUrl}/merchant/${merchantId}/product`,
        merchantProduct
      )
      .pipe(catchError(handleError));
  }

  updateMerchantProduct(
    merchantId: number,
    merchantProductId: number,
    merchantProduct: MerchantProduct
  ): Observable<MerchantProduct> {
    return this.http
      .put<MerchantProduct>(
        `${this.apiUrl}/merchant/${merchantId}/product/${merchantProductId}`,
        merchantProduct
      )
      .pipe(catchError(handleError));
  }

  getMerchantProduct(
    merchantId: number,
    merchantProductId: number
  ): Observable<MerchantProduct> {
    return this.http
      .get<MerchantProduct>(
        `${this.apiUrl}/merchant/${merchantId}/product/${merchantProductId}`
      )
      .pipe(catchError(handleError));
  }

  deleteMerchantProduct(
    merchantId: number,
    merchantProductId: number
  ): Observable<MerchantProduct> {
    return this.http
      .delete<MerchantProduct>(
        `${this.apiUrl}/merchant/${merchantId}/product/${merchantProductId}`
      )
      .pipe(catchError(handleError));
  }

  assignMerchantGlobalProduct(
    merchantId: number,
    GlobalProductCategoryId: number | string
  ): Observable<MerchantProduct> {
    return this.http
      .put<MerchantProduct>(
        `${this.apiUrl}/assign/global-product/${GlobalProductCategoryId}/merchant/${merchantId}`,
        null
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
        `${this.apiUrl}/product/updateWorkflowStatus/${workFlowLogId}`,
        workFlow,
        {
          params: {
            ...(merchantId && { merchantId }),
          },
        }
      )
      .pipe(catchError(handleError));
  }
}
