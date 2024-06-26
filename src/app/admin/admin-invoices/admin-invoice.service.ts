import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AdminInvoice, InvoiceSearch } from "@models/invoices.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AdminInvoiceService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/invoice-service/invoice`;
  }

  getAdminInvoices(
    searchObj?: InvoiceSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<AdminInvoice>> {
    return this.http
      .get<BaseResponse<AdminInvoice>>(`${this.apiUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }
}
