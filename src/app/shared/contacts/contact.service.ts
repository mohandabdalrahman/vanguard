import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "../../helpers/handle-error";
import { Contact, ContactSearch } from "./contact.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class ContactService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-service/merchant`;
  }

  getContacts(
    merchantId: number,
    searchObj?: ContactSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<Contact>> {
    return this.http
      .get<BaseResponse<Contact>>(`${this.apiUrl}/${merchantId}/contact`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  createContact(merchantId: number, contact: Contact): Observable<Contact> {
    return this.http
      .post<Contact>(`${this.apiUrl}/${merchantId}/contact`, contact)
      .pipe(catchError(handleError));
  }

  updateContact(
    merchantId: number,
    contactId: number,
    contact: Contact
  ): Observable<Contact> {
    return this.http
      .put<Contact>(
        `${this.apiUrl}/${merchantId}/contact/${contactId}`,
        contact
      )
      .pipe(catchError(handleError));
  }

  getContact(merchantId: number, contactId: number): Observable<Contact> {
    return this.http
      .get<Contact>(`${this.apiUrl}/${merchantId}/contact/${contactId}`)
      .pipe(catchError(handleError));
  }

  deleteContact(merchantId: number, contactId: number): Observable<Contact> {
    return this.http
      .delete<Contact>(`${this.apiUrl}/${merchantId}/contact/${contactId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    merchantId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${merchantId}/contact/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
