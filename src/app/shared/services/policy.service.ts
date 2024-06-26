import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { handleError } from "@helpers/handle-error";
import { Policy } from "@models/policy.model";
import { BaseResponse } from "@models/response.model";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { UnAssignedPolicySearch } from "@models/unassigned-policy.model";

@Injectable({
  providedIn: "root",
})
export class PolicyService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
  }

  getUnsuspendedPolicies(
    corporateId: number,
    searchObj: Partial<UnAssignedPolicySearch>
  ): Observable<Policy[]> {
    return this.http
      .get<Policy[]>(`${this.apiUrl}/${corporateId}/policy`, {
        params: {
          ...searchObj,
        },
      })
      .pipe(catchError(handleError));
  }

  getPolicy(
    corporateId: number,
    policyId: number
  ): Observable<BaseResponse<Policy>> {
    return this.http
      .get<BaseResponse<Policy>>(
        `${this.apiUrl}/${corporateId}/policy/${policyId}`
      )
      .pipe(catchError(handleError));
  }
}
