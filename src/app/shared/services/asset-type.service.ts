import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {AlertableDataDto} from "@models/alertable-data.model";

@Injectable({
  providedIn: 'root'
})
export class AssetTypeService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/asset`;
  }

  getAssetType(assetNfcId: number): Observable<String> {
    return this.http
      .get<String>(`${this.apiUrl}/${assetNfcId}/type`)
      .pipe(catchError(handleError));
  }

  getAlertableDataFields(): Observable<AlertableDataDto[]> {
    return this.http
      .get<AlertableDataDto[]>(`${this.apiUrl}/alertable-data`)
      .pipe(catchError(handleError));
  }
}
