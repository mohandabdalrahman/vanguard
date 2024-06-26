import {Injectable} from '@angular/core';
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BaseResponse} from "@models/response.model";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {Invoice, InvoiceSearch} from "@models/invoices.model";

@Injectable({
  providedIn: 'root'
})
export class CorporateInvoicesService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/invoice-service/corporate`;
  }

  getCorporateInvoices(
    corporateId: number,
    searchObj?: InvoiceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = 'DESC',
    sortBy?: string
  ): Observable<BaseResponse<Invoice>> {
    return this.http
      .get<BaseResponse<Invoice>>(
        `${this.apiUrl}/${corporateId}/invoice`,
        {
          params: {
            ...searchObj,
            ...(pageNo && {pageNo}),
            ...(pageSize && {pageSize}),
            ...(sortDirection && {sortDirection}),
            ...(sortBy && {sortBy}),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  getCorporateInvoice(
    corporateId: number,
    invoiceId: number,
  ): Observable<Invoice> {
    return this.http
      .get<Invoice>(
        `${this.apiUrl}/${corporateId}/invoice/${invoiceId}`,
      )
      .pipe(catchError(handleError));
  }
}
