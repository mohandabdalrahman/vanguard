import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {AssetType} from "@models/asset-type";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {BaseResponse} from "@models/response.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {CorporateVehicle, ManualMileage, ManualReview, VehicleType} from "./corporate-vehicle.model";
import {WorkFlowDto} from "@models/work-flow.model";

@Injectable({
  providedIn: "root",
})
export class CorporateVehicleService {
  apiUrl: string;
  vehicleTypeUrl: string;
  workFlowUrl: string;
  reportingUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
    this.vehicleTypeUrl = `${environment.baseUrl}/corporate-orchestration-service/asset/vehicle/type`;
    this.workFlowUrl = `${environment.baseUrl}/corporate-orchestration-service/asset`;
    this.reportingUrl = `${environment.baseUrl}/reporting-service/vehicle`;
  }

  getCorporateVehicles(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Vehicle>,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<CorporateVehicle>> {
    return this.http
      .get<BaseResponse<CorporateVehicle>>(
        `${this.apiUrl}/${corporateId}/asset/vehicle`,
        {
          params: {
            ...searchObj,
            type: AssetType.Vehicle,
            ...(pageNo && {pageNo}),
            ...(pageSize && {pageSize}),
            ...(sortDirection && {sortDirection}),
            ...(sortBy && {sortBy}),
          },
        }
      )
      .pipe(catchError(handleError));
  }

  createCorporateVehicle(
    corporateId: number,
    corporateVehicle: CorporateVehicle
  ): Observable<CorporateVehicle> {
    return this.http
      .post<CorporateVehicle>(
        `${this.apiUrl}/${corporateId}/asset/vehicle`,
        corporateVehicle
      )
      .pipe(catchError(handleError));
  }

  updateCorporateVehicle(
    corporateId: number,
    corporateVehicleId: number,
    corporateVehicle: CorporateVehicle
  ): Observable<CorporateVehicle> {
    return this.http
      .put<CorporateVehicle>(
        `${this.apiUrl}/${corporateId}/asset/vehicle/${corporateVehicleId}`,
        corporateVehicle
      )
      .pipe(catchError(handleError));
  }

  getCorporateVehicle(
    corporateId: number,
    corporateVehicleId: number,
    includeAlertableData: boolean = false
  ): Observable<CorporateVehicle> {
    return this.http
      .get<CorporateVehicle>(
        `${this.apiUrl}/${corporateId}/asset/vehicle/${corporateVehicleId}`, {
          params: {
            includeAlertableData
          }
        }
      )
      .pipe(catchError(handleError));
  }

  deleteCorporateVehicle(
    corporateId: number,
    corporateVehicleId: number
  ): Observable<CorporateVehicle> {
    return this.http
      .delete<CorporateVehicle>(
        `${this.apiUrl}/${corporateId}/asset/vehicle/${corporateVehicleId}`
      )
      .pipe(catchError(handleError));
  }

  getVehicleConsumptionRates(vehicleId: number,date:string) 
    : Observable<BaseResponse<any>> {
      return this.http
        .get<BaseResponse<any>>(`${this.reportingUrl}/${vehicleId}/consumption-rates`,{
          params:{date}
        })
        .pipe(catchError(handleError));
    }

  getVehicleTypes(searchObj?: any): Observable<BaseResponse<VehicleType>> {
    return this.http
      .get<BaseResponse<VehicleType>>(`${this.vehicleTypeUrl}`, {
        params: {...searchObj},
      })
      .pipe(catchError(handleError));
  }

  assignPolicyToCorporateVehicle(corporateId, policy, overwritePolicy) {
    const headers = new HttpHeaders().set(
      "overrideSameProductCategoryAssetPolicies",
      String(overwritePolicy)
    );
    return this.http
      .put(`${this.apiUrl}/${corporateId}/asset`, policy, {headers})
      .pipe(catchError(handleError));
  }

  updateWorkflowStatus(
    workFlowLogId: number,
    workFlow: WorkFlowDto
  ): Observable<number | string> {
    return this.http
      .put<number | string>(
        `${this.workFlowUrl}/vehicle/updateWorkflowStatus/${workFlowLogId}`,
        workFlow
      )
      .pipe(catchError(handleError));
  }

  createManualReview(
    corporateId: number,
    ouId: number,
    assetId: number,
    manualReview: ManualReview
  ): Observable<ManualReview> {
    return this.http
      .post<ManualReview>(
        `${this.apiUrl}/${corporateId}/ou/${ouId}/asset/${assetId}/review`,
        manualReview
      )
      .pipe(catchError(handleError));
  }


  retrieveCorporateVehicle(
    corporateId: number,
    vehicleId: number,
    includeAlertableData: boolean = false
  ): Observable<CorporateVehicle> {
    return this.http
      .get<CorporateVehicle>(
        `${this.apiUrl}/${corporateId}/asset/vehicle/${vehicleId}`, {
          params: {
            includeAlertableData
          }
        }
      )
      .pipe(catchError(handleError));
  }


  updateManualMileage(
    corporateId: number,
    manualMileage: ManualMileage[]
  ): Observable<number> {
    return this.http
      .put<number>(
        `${this.apiUrl}/${corporateId}/asset/vehicle/calibrate-mileage`,
        manualMileage
      )
      .pipe(catchError(handleError));
  }

}
