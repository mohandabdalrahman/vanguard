import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { SystemType } from "@models/system-type";
import { MerchantService } from "../merchants/merchant.service";
import { CorporateService } from "../corporates/corporate.service";

@Injectable({
  providedIn: "root",
})
export class SystemDataResolver implements Resolve<boolean> {
  systemType: SystemType;

  constructor(
    private merchantService: MerchantService,
    private corporateService: CorporateService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.systemType = route.data["systemType"];
    if (this.systemType === SystemType.MERCHANT) {
      return this.merchantService.getMerchants();
    } else if (this.systemType === SystemType.CORPORATE) {
      return this.corporateService.getCorporates();
    }
  }
}
