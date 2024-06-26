import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { ContactType } from "@models/contact-type.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ContactTypeService {
  apiUrl: string;
  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/lookup-service/contact-type`;
  }

  getContactTypes(searchObj?: any): Observable<BaseResponse<ContactType>> {
    return this.http
      .get<BaseResponse<ContactType>>(`${this.apiUrl}`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }

  getContactType(contactTypeId: number): Observable<ContactType> {
    return this.http
      .get<ContactType>(`${this.apiUrl}/${contactTypeId}`)
      .pipe(catchError(handleError));
  }
}
