import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {AssignCard, Card, CardSearch} from "@models/card.model";
import {BaseResponse} from "@models/response.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateCardService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

  getCorporateCards(
    corporateId: number,
    searchObj?: CardSearch,
    pageNo?: number,
    pageSize?: number
  ): Observable<BaseResponse<Card>> {
    return this.http
      .get<BaseResponse<Card>>(`${this.apiUrl}/${corporateId}/card`, {
        params: {
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
        },
      })
      .pipe(catchError(handleError));
  }

  deleteCorporateCard(
    corporateId: number,
    corporateCardId: number
  ): Observable<Card> {
    return this.http
      .delete<Card>(`${this.apiUrl}/${corporateId}/card/${corporateCardId}`)
      .pipe(catchError(handleError));
  }

  getCorporateCard(
    corporateId: number,
    corporateCardId: number
  ): Observable<Card> {
    return this.http
      .get<Card>(`${this.apiUrl}/${corporateId}/card/${corporateCardId}`)
      .pipe(catchError(handleError));
  }

  assignCardToUser(
    systemId: number,
    nfcId: number,
    userId: number
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/${systemId}/assign/nfc/${nfcId}/user/${userId}`,
        null
      )
      .pipe(catchError(handleError));
  }

  assignCardToUnassignedUser(cards: AssignCard[]): Observable<AssignCard> {
    return this.http
      .post<AssignCard>(`${this.apiUrl}/create/assign/nfc`, cards)
      .pipe(catchError(handleError));
  }

  unAssignCardFromUser(systemId: number, nfcId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${systemId}/unassign/nfc/${nfcId}`)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    corporateId: number
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${corporateId}/card/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }

  updateUserCardWorkflowStatus(
    workFlowLogId: number,
    relatedSystemId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.apiUrl}/${relatedSystemId}/usercard/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
