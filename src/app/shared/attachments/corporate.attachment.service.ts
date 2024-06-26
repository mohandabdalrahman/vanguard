import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { handleError } from "../../helpers/handle-error";
import { Attachment } from "./attachment.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateAttachmentService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-service/corporate`;
  }

  getAttachments(
    corporateId: number,
    searchObj?: Attachment
  ): Observable<Attachment[]> {
    return this.http
      .get<Attachment[]>(`${this.apiUrl}/${corporateId}/document`, {
        params: {
          ...searchObj,
        },
      })
      .pipe(catchError(handleError));
  }

  downloadAttachment(corporateId: number, documentId: number) {
    return this.http
      .get<Blob>(`${this.apiUrl}/${corporateId}/document/${documentId}`, {
        responseType: "blob" as "json",
      })
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    corporateId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${corporateId}/document/workflow/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
