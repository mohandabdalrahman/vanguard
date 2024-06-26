import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AssetType } from "@models/asset-type";
import { CorporateAssetSearch } from "@models/corporate-asset-search.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { CorporateContainer } from "./corporate-container.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateContainerService {
  apiUrl: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
    this.workFlowUrl = `${environment.baseUrl}/corporate-orchestration-service/asset`;
  }

  getCorporateContainers(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Container>,
    pageNo?: number,
    pageSize?: number,
    sortDirection?: string,
    sortBy?: string
  ): Observable<BaseResponse<CorporateContainer>> {
    return this.http
      .get<BaseResponse<CorporateContainer>>(
        `${this.apiUrl}/${corporateId}/asset/container`,
        {
          params: {
            ...searchObj,
            type: AssetType.Container,
            ...(pageNo && { pageNo }),
            ...(pageSize && { pageSize }),
            ...(sortDirection && { sortDirection }),
            ...(sortBy && { sortBy }),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporateContainer(
    corporateId: number,
    corporateContainer: CorporateContainer
  ): Observable<CorporateContainer> {
    return this.http
      .post<CorporateContainer>(
        `${this.apiUrl}/${corporateId}/asset/container`,
        corporateContainer
      )
      .pipe(catchError(handleError));
  }

  updateCorporateContainer(
    corporateId: number,
    corporateContainerId: number,
    corporateContainer: CorporateContainer
  ): Observable<CorporateContainer> {
    return this.http
      .put<CorporateContainer>(
        `${this.apiUrl}/${corporateId}/asset/container/${corporateContainerId}`,
        corporateContainer
      )
      .pipe(catchError(handleError));
  }

  getCorporateContainer(
    corporateId: number,
    corporateContainerId: number
  ): Observable<CorporateContainer> {
    return this.http
      .get<CorporateContainer>(
        `${this.apiUrl}/${corporateId}/asset/container/${corporateContainerId}`
      )
      .pipe(catchError(handleError));
  }

  deleteCorporateContainer(
    corporateId: number,
    corporateContainerId: number
  ): Observable<CorporateContainer> {
    return this.http
      .delete<CorporateContainer>(
        `${this.apiUrl}/${corporateId}/asset/container/${corporateContainerId}`
      )
      .pipe(catchError(handleError));
  }

  updateCorporateContainerPolicy(corporatId, ploicy, overwritePolicy) {
    let httpOptions = {
      headers: new HttpHeaders({
        overrideSameProductCategoryAssetPolicies: overwritePolicy,
      }),
    };
    return this.http
      .put(`${this.apiUrl}/${corporatId}/asset`, ploicy, httpOptions)
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.workFlowUrl}/container/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
