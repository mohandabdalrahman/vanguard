import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { ProductType } from "@models/product-type.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProductTypeService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/product-service/product-type`;
  }

  getProductTypes(
    countryId?: number,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<ProductType>> {

    let params = {
      ...(countryId && { countryId }),
      ...(pageNo && { pageNo }),
      ...(pageSize && { pageSize }),
    }
    return this.http
      .get<BaseResponse<ProductType>>(`${this.apiUrl}`, {
        params:
          params
      })
      .pipe(catchError(handleError));
  }

  getProductType(
    id: number,
  ): Observable<ProductType> {

    return this.http
      .get<ProductType>(`${this.apiUrl}/${id}`)
      .pipe(catchError(handleError));
  }

}
