import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseResponse } from "@models/response.model";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { Invoice, InvoiceSearch } from "@models/invoices.model";
import { WorkFlowDto } from "@models/work-flow.model";

export interface InvoicesSerialNumber {
  invoiceIds: number[];
  startSerialNumber: number;
  serialPrefix: string;
  serialSuffix: string;
}

@Injectable({
  providedIn: "root",
})
export class MerchantInvoicesService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/invoice-service/merchant`;
  }

  getMerchantInvoices(
    merchantId: number,
    searchObj?: InvoiceSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<Invoice>> {
    return this.http
      .get<BaseResponse<Invoice>>(`${this.apiUrl}/${merchantId}/invoice`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(sortDirection && { sortDirection }),
          ...(sortBy && { sortBy }),
        },
      })
      .pipe(catchError(handleError));
  }

  getMerchantInvoice(
    merchantId: number,
    invoiceId: number
  ): Observable<Invoice> {
    return this.http
      .get<Invoice>(`${this.apiUrl}/${merchantId}/invoice/${invoiceId}`)
      .pipe(catchError(handleError));
  }

  setInvoiceSerialNumber(
    merchantId: number,
    invoiceId: number,
    merchantInvoice: Invoice
  ): Observable<Invoice> {
    return this.http
      .put<Invoice>(
        `${this.apiUrl}/${merchantId}/invoice/${invoiceId}`,
        merchantInvoice
      )
      .pipe(catchError(handleError));
  }

  settleInvoices(
    merchantId: number,
    invoicesIds: number[]
  ): Observable<Invoice> {
    return this.http
      .put<Invoice>(`${this.apiUrl}/${merchantId}/invoice/settle`, invoicesIds)
      .pipe(catchError(handleError));
  }

  settleInvoicesWithOutMerchantId(invoicesIds: number[]): Observable<Invoice> {
    return this.http
      .put<Invoice>(`${this.apiUrl}/invoice/settle`, invoicesIds)
      .pipe(catchError(handleError));
  }

  setSerialNumbers(
    merchantId: number,
    invoicesSerialNumber: InvoicesSerialNumber,
    overrideExistingSerial?: boolean,
    incrementationValue?: number
  ): Observable<Invoice> {
    return this.http
      .put<Invoice>(
        `${this.apiUrl}/${merchantId}/invoice`,
        invoicesSerialNumber,
        {
          params: {
            ...(overrideExistingSerial && { overrideExistingSerial }),
            ...(incrementationValue && { incrementationValue }),
          },
        }
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
        `${this.apiUrl}/${merchantId}/invoice/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
