import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { Card, CardSearch } from "@models/card.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CardService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/nfc-service`;
  }

  getCards(
    systemType: string,
    systemId: number,
    searchObj?: CardSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<Card>> {
    return this.http
      .get<BaseResponse<Card>>(
        `${this.apiUrl}/${systemType}/${systemId}/card`,
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

  getCard(
    systemType: string,
    systemId: number,
    cardId: number
  ): Observable<Card> {
    return this.http
      .get<Card>(`${this.apiUrl}/${systemType}/${systemId}/card/${cardId}`)
      .pipe(catchError(handleError));
  }

  deleteCard(
    systemType: string,
    systemId: number,
    cardId: number
  ): Observable<Card> {
    return this.http
      .delete<Card>(`${this.apiUrl}/${systemType}/${systemId}/card/${cardId}`)
      .pipe(catchError(handleError));
  }

  createCard(
    systemType: string,
    systemId: number,
    card: Card
  ): Observable<Card> {
    return this.http
      .post<Card>(`${this.apiUrl}/${systemType}/${systemId}/card`, card)
      .pipe(catchError(handleError));
  }

  updateCard(
    systemType: string,
    systemId: number,
    cardId: number,
    card: Card
  ): Observable<Card> {
    return this.http
      .put<Card>(
        `${this.apiUrl}/${systemType}/${systemId}/card/${cardId}`,
        card
      )
      .pipe(catchError(handleError));
  }

  assignCardToUser(
    systemType: string,
    systemId: number,
    nfcId: number,
    userId: number
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/${systemType}/${systemId}/assign/nfc/${nfcId}/user/${userId}`,
        null
      )
      .pipe(catchError(handleError));
  }

  unAssignCardFromUser(
    systemType: string,
    systemId: number,
    nfcId: number
  ): Observable<any> {
    return this.http
      .delete<any>(
        `${this.apiUrl}/${systemType}/${systemId}/unassign/nfc/${nfcId}`
      )
      .pipe(catchError(handleError));
  }
}
