import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import {
  CorporateContact,
  CorporateContactSearch,
} from "./corporate-contact.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateContactService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-service/corporate`;
  }

  getCorporateContacts(
    corporateId: number,
    searchObj?: CorporateContactSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<CorporateContact>> {
    return this.http
      .get<BaseResponse<CorporateContact>>(
        `${this.apiUrl}/${corporateId}/contact`,
        {
          params: {
            ...searchObj,
            ...(pageNo && { pageNo }),
            ...(pageSize && { pageSize }),
            ...(sortDirection && { sortDirection }),
            ...(sortBy && { sortBy }),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporateContact(
    corporateId: number,
    corporateContact: CorporateContact
  ): Observable<CorporateContact> {
    return this.http
      .post<CorporateContact>(
        `${this.apiUrl}/${corporateId}/contact`,
        corporateContact
      )
      .pipe(catchError(handleError));
  }

  updateCorporateContact(
    corporateId: number,
    corporateContactId: number,
    corporateContact: CorporateContact
  ): Observable<CorporateContact> {
    return this.http
      .put<CorporateContact>(
        `${this.apiUrl}/${corporateId}/contact/${corporateContactId}`,
        corporateContact
      )
      .pipe(catchError(handleError));
  }

  getCorporateContact(
    corporateId: number,
    corporateContactId: number
  ): Observable<CorporateContact> {
    return this.http
      .get<CorporateContact>(
        `${this.apiUrl}/${corporateId}/contact/${corporateContactId}`
      )
      .pipe(catchError(handleError));
  }

  deleteCorporateContact(
    corporateId: number,
    corporateContactId: number
  ): Observable<any> {
    return this.http
      .delete<any>(
        `${this.apiUrl}/${corporateId}/contact/${corporateContactId}`
      )
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    corporateId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${corporateId}/contact/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
