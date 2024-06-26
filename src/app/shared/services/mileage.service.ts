import {Injectable} from '@angular/core';
import {environment} from "@environments/environment";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MileageService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/s3-mgmt-service/s3/mileage/merchant`;
  }


  getMileageFileName(merchantId: number, siteId: number, trxId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${merchantId}/site/${siteId}/fetch`, {
        params: {
          trxId
        }
      })
      .pipe(catchError(handleError));
  }


  downloadMileageFileName(merchantId: number, siteId: number, trxId: number, fileName: string): Observable<any> {
    return this.http
      .get<Blob>(`${this.apiUrl}/${merchantId}/site/${siteId}/trx/${trxId}/filename/${fileName}` )
      .pipe(catchError(handleError));
  }
}
