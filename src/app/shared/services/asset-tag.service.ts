import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {AssetTag} from "@models/asset-tag";
import {BaseResponse} from "@models/response.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AssetTagService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

  getAssetTags(
    corporateId: number,
    searchObj?: any
  ): Observable<BaseResponse<AssetTag>> {
    return this.http
      .get<BaseResponse<AssetTag>>(`${this.apiUrl}/${corporateId}/assettag`, {
        params: {...searchObj},
      })
      .pipe(catchError(handleError));
  }

  getAssetTag(
    corporateId: number,
    assetTagId: number
  ): Observable<AssetTag> {
    return this.http
      .get<AssetTag>(
        `${this.apiUrl}/${corporateId}/assettag/${assetTagId}`
      )
      .pipe(catchError(handleError));
  }


  createAssetTag(
    corporateId: number,
    assetTagName: string
  ): Observable<AssetTag> {
    // let enName, localName;
    // const arabic = /[\u0600-\u06FF]/;
    // if (arabic.test(assetTagName)) {
    //   localName = assetTagName;
    // } else {
    //   enName = assetTagName;
    // }
    return this.http
      .post<AssetTag>(
        `${this.apiUrl}/${corporateId}/assettag`,
        {enName: assetTagName}
      )
      .pipe(catchError(handleError));
  }
}
