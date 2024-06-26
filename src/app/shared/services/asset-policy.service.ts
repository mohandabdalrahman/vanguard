import {Injectable} from '@angular/core';
import {environment} from "@environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BaseResponse} from "@models/response.model";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {Observable} from "rxjs";
import {OuAssetCountDto} from "@models/asset-policy.model";
import {AssetType} from "@models/asset-type";
import {DynamicPolicy} from "@models/dynamic-policy.model";

@Injectable({
  providedIn: 'root'
})
export class AssetPolicyService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

//todo add policy type
  updateAssetPolicy(corporateId: number, overrideSameProductCategoryAssetPolicies, assetPolicy: any): Observable<BaseResponse<any>> {
    let httpOptions = {
      headers: new HttpHeaders({
        overrideSameProductCategoryAssetPolicies: overrideSameProductCategoryAssetPolicies,
      }),
    };
    return this.http
      .put<BaseResponse<any>>(`${this.apiUrl}/${corporateId}/asset`, assetPolicy, httpOptions)
      .pipe(catchError(handleError));
  }

  getCorporateAssetCount(
    corporateId: number,
    searchObj?: { ouIds: number[], types: AssetType[] | string[] },
  ): Observable<OuAssetCountDto[]> {
    return this.http
      .get<OuAssetCountDto[]>(`${this.apiUrl}/${corporateId}/asset/count`, {
        params: {
          ...searchObj,
        },
      })
      .pipe(catchError(handleError));
  }


  assignDynamicPolicies(corporateId: number, policyId: number, dynamicPolicies: DynamicPolicy[]): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        overrideSameProductCategoryAssetPolicies: "true",
      }),
    };
    return this.http
      .put<any>(`${this.apiUrl}/${corporateId}/policy/${policyId}/asset`, dynamicPolicies, httpOptions)
      .pipe(catchError(handleError));
  }


}
