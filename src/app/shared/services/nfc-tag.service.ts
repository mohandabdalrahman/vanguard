import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseResponse } from "@models/response.model";
import { catchError } from "rxjs/operators";
import { handleError } from "@helpers/handle-error";
import { NfcTag } from "@models/nfc-tag.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class NfcTagService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

  getNfcTags(
    systemId: number,
    searchObj?: any
  ): Observable<BaseResponse<NfcTag>> {
    return this.http
      .get<BaseResponse<NfcTag>>(`${this.apiUrl}/${systemId}/nfcTag`, {
        params: { ...searchObj },
      })
      .pipe(catchError(handleError));
  }

  getNfcTag(systemId: number, nfcTagId: number): Observable<NfcTag> {
    return this.http
      .get<NfcTag>(`${this.apiUrl}/${systemId}/nfcTag/${nfcTagId}`, {})
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    relatedSystemId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${relatedSystemId}/nfcTag/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
