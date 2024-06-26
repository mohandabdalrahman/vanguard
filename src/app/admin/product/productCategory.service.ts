import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { ProductCategory, ProductSearch } from "./product-category.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class ProductCategoryService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/product-service/product-category`;
  }

  getProducts(
    searchObj?: ProductSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<ProductCategory>> {
    return this.http
      .get<BaseResponse<ProductCategory>>(`${this.apiUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  createProduct(product: ProductCategory): Observable<ProductCategory> {
    return this.http
      .post<ProductCategory>(`${this.apiUrl}`, product)
      .pipe(catchError(handleError));
  }

  updateProduct(
    productId: number,
    product: ProductCategory
  ): Observable<ProductCategory> {
    return this.http
      .put<ProductCategory>(`${this.apiUrl}/${productId}`, product)
      .pipe(catchError(handleError));
  }

  getProduct(productId: number | string): Observable<ProductCategory> {
    return this.http
      .get<ProductCategory>(`${this.apiUrl}/${productId}`)
      .pipe(catchError(handleError));
  }

  deleteProduct(productId: number): Observable<ProductCategory> {
    return this.http
      .delete<ProductCategory>(`${this.apiUrl}/${productId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/updateWorkflowStatus/${workFlowLogId}`,
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
