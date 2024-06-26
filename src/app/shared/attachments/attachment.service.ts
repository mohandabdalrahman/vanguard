import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "../../helpers/handle-error";
import { Attachment } from "./attachment.model";

@Injectable({
  providedIn: "root",
})
export class AttachmentService {
  apiUrl: string;
  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/merchant-service/merchant/files`;
  }

  getAttachments(
    merchantId: number,
    searchObj?: Attachment
  ): Observable<Attachment[]> {
    return this.http
      .get<Attachment[]>(`${this.apiUrl}/${merchantId}/fetch`, {
        params: {
          ...searchObj,
        },
      })
      .pipe(catchError(handleError));
  }

  downloadAttachment(merchantId: number, documentId: number) {
    return this.http
      .get<Blob>(`${this.apiUrl}/${merchantId}/${documentId}`, { responseType: 'blob' as 'json'})
      .pipe(catchError(handleError));
  }
}
