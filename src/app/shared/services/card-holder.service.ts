import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { CardHolder } from "@models/card-holder.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CardHolderService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

  getCardHolders(
    corporateId: number,
    searchObj?: any,
    pageNo?: number,
    pageSize?: number,
    sortDirection : string = "DESC",
    sortBy? : string
  ): Observable<BaseResponse<CardHolder>> {
    return this.http
      .get<BaseResponse<CardHolder>>(`${this.apiUrl}/${corporateId}/asset/user`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
          ...(sortDirection && {sortDirection}),
          ...(sortBy && {sortBy})
        },
      })
      .pipe(catchError(handleError));
  }
  getCardHolder(
    corporateId: number,
    assetUserId: number
  ): Observable<CardHolder> {
    return this.http
      .get<CardHolder>(
        `${this.apiUrl}/${corporateId}/asset/user/${assetUserId}`
      )
      .pipe(catchError(handleError));
  }

  updateCardHolderPolicy(
    corporateId: number,
    cardholderId: number,
    cardholder: CardHolder): Observable<CardHolder> {
    return this.http.put<CardHolder>(
      `${this.apiUrl}/${corporateId}/asset/user/${cardholderId}`, cardholder
    )
      .pipe(catchError(handleError));
  }
}
