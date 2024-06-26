import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { AssetType } from "@models/asset-type";
import { CorporateAssetSearch } from "@models/corporate-asset-search.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { CorporateHardware } from "./corporate-hardware.model";
import { WorkFlowDto } from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateHardwareService {
  apiUrl: string;
  workFlowUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
    this.workFlowUrl = `${environment.baseUrl}/corporate-orchestration-service/asset`;
  }

  getCorporateHardwares(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Hardware>,
    pageNo?: number,
    pageSize?: number,
    sortDirection?: string,
    sortBy?: string
  ): Observable<BaseResponse<CorporateHardware>> {
    return this.http
      .get<BaseResponse<CorporateHardware>>(
        `${this.apiUrl}/${corporateId}/asset/hardware`,
        {
          params: {
            ...searchObj,
            type: AssetType.Hardware,
            ...(pageNo && { pageNo }),
            ...(pageSize && { pageSize }),
            ...(sortDirection && { sortDirection }),
            ...(sortBy && { sortBy }),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporateHardware(
    corporateId: number,
    corporateHardware: CorporateHardware
  ): Observable<CorporateHardware> {
    return this.http
      .post<CorporateHardware>(
        `${this.apiUrl}/${corporateId}/asset/hardware`,
        corporateHardware
      )
      .pipe(catchError(handleError));
  }

  updateCorporateHardware(
    corporateId: number,
    corporateHardwareId: number,
    corporateHardware: CorporateHardware
  ): Observable<CorporateHardware> {
    return this.http
      .put<CorporateHardware>(
        `${this.apiUrl}/${corporateId}/asset/hardware/${corporateHardwareId}`,
        corporateHardware
      )
      .pipe(catchError(handleError));
  }

  getCorporateHardware(
    corporateId: number,
    corporateHardwareId: number
  ): Observable<CorporateHardware> {
    return this.http
      .get<CorporateHardware>(
        `${this.apiUrl}/${corporateId}/asset/hardware/${corporateHardwareId}`
      )
      .pipe(catchError(handleError));
  }

  deleteCorporateHardware(
    corporateId: number,
    corporateHardwareId: number
  ): Observable<CorporateHardware> {
    return this.http
      .delete<CorporateHardware>(
        `${this.apiUrl}/${corporateId}/asset/hardware/${corporateHardwareId}`
      )
      .pipe(catchError(handleError));
  }

  updateCorporateHardwaresPolicy(corporatId, ploicy, overwritePolicy) {
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
        `${this.workFlowUrl}/hardware/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }
}
