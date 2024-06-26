import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateVehicle, VehicleType} from "../corporate-vehicle.model";
import {CorporateVehicleService} from "../corporate-vehicle.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {NfcTagService} from "@shared/services/nfc-tag.service";
import {NfcTag} from "@models/nfc-tag.model";
import {AssetType} from "@models/asset-type";
import {Policy} from "@models/policy.model";
import {PolicyService} from "@shared/services/policy.service";
import {AssetPolicy} from "@models/asset-policy.model";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";
import {BaseResponse} from "@models/response.model";
import {CorporateUserService} from "app/admin/corporate-user/corporate-user.service";
import {CityService} from "../../cities/city.service";
import {City} from "../../cities/city.model";
import {User} from "@models/user.model";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-vehicle-main-info",
  templateUrl: "./vehicle-main-info.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./vehicle-main-info.scss",
  ],
})
export class VehicleMainInfo implements OnInit, OnDestroy {

  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  yAxisLabel: string = "";
  gradient: boolean = true;
  corporateId: number;
  corporateVehicleId: number;
  corporateVehicle :any;
  userType: string;
  currentLang: string;
  vehicleTypes: VehicleType[];
  vehicleTypeId: number;
  policies: Policy[];
  suspended: boolean;
  city: City;
  corporateUsers: User[];
  isTabView: boolean = false;
  updateUrl: string;
  private subs = new SubSink();
  corporateVehicleFuelType;
  corporateOu: CorporateOu
  vehicleConsumnptionRates:any
  view:any
  colorScheme = {
    domain: ['rgba(40, 190, 137,0.5)','rgba(40, 190, 137,1)']
  };
  selectedMonth:string='2024-06';
  date=new  Date()

  UpdateLink;

  constructor(
    private route: ActivatedRoute,
    private corporateVehicleService: CorporateVehicleService,
    private corporateUserService: CorporateUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private nfcTagService: NfcTagService,
    private policyService: PolicyService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private cityService: CityService,
    private router: Router,
    private corporateOuService: CorporateOuService,
    private DatePipe:DatePipe
  ) {

  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"];
    if (this.isTabView) {
      this.updateUrl =
        this.router.url.split("/").slice(0, -1).join("/") + "/update";
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.getVehicleTypeName(this.vehicleTypeId);
        if (lang === "ar") {
          this.corporateVehicle["assetPolicies"] = this.policies.map(
            (p) => p.localeName
          );
        }
        this.corporateVehicle["originCity"] =
          this.currentLang === "en" ? this.city?.enName : this.city?.localeName;
        this.corporateVehicle["authorizedUsers"] =
          this.currentLang === "en"
            ? this.corporateUsers.map((u) => u.enName)
            : this.corporateUsers.map((u) => u.localeName);

        this.corporateOuService.setOuName(this.corporateVehicle, this.corporateOu, this.currentLang);

      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.corporateVehicleId = params["corporateVehicleId"];
      })
    );
    this.selectedMonth=this.DatePipe.transform(this.date, 'yyyy-MM')
    this.showCorporateVehicleDetails();
    
    if(this.userType=='admin'){
      this.UpdateLink=['/admin/corporates/',this.corporateId,'details','vehicles',this.corporateVehicleId,'update']
    }else{
      this.UpdateLink=['/corporate/vehicles/',this.corporateVehicleId,'update']
    }

  }

  showCorporateVehicleDetails(): void {
    
    this.subs.add(
      this.corporateVehicleService
        .retrieveCorporateVehicle(this.corporateId, this.corporateVehicleId , true)
        .subscribe(
          (corporateVehicle: CorporateVehicle) => {
            if (corporateVehicle) {
              sessionStorage.setItem('corporateVehicle', JSON.stringify(corporateVehicle))
              const {
                assetPolicies,
                nfcId,
                vehicleTypeId,
                suspended,
                authorizedUserIds,
                originCity,
                fuelType,
                ouId,
                ...other
              } = removeUnNeededProps(corporateVehicle, [
                "corporateId",
                "assetType",
                "assetTagId",
                "creationDate",
                "alertableData"
              ]);
              this.corporateVehicle = other;
              this.getVehicleConsumptionRates(this.corporateVehicle.assetId,this.corporateVehicle.plateNumber,this.corporateVehicle.consumptionLowRate,this.corporateVehicle.consumptionHighRate);
              this.corporateVehicle["licenseExpiryDate"] = this.corporateVehicle["licenseExpiryDate"]?.substring(0, this.corporateVehicle["licenseExpiryDate"].length - 9)
              this.corporateVehicleFuelType = $localize`fuelType.` + fuelType;
              this.suspended = suspended;
              if (ouId && this.authService.isOuEnabled()) {
                this.getCorporateOuDetails(ouId)
              }
              if (typeof originCity === "number") { 
                this.getCity(+originCity);
              }
              if (corporateVehicle?.nfcId) {
                this.getCorporateNfc(corporateVehicle.nfcId);
              }
              this.suspended = suspended;
              if (corporateVehicle.assetPolicies.length > 0) {
                this.convertAssetPoliciesToNames(
                  corporateVehicle.assetPolicies
                );
              }

              if (authorizedUserIds.length > 0) {
                this.convertAuthrizedUsersToNames(
                  this.corporateId,
                  authorizedUserIds
                );
              }
              this.vehicleTypeId = vehicleTypeId;
              if (vehicleTypeId) {
                this.getVehicleTypes(vehicleTypeId);
              }
            } else {
              this.translate
                .get(["error.noVehiclesFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getVehicleTypeName(vehicleTypeId: number) {
    this.corporateVehicle["vehicleType"] =
      this.currentLang === "en"
        ? this.vehicleTypes?.find((v) => v.id === vehicleTypeId)?.enName ?? ""
        : this.vehicleTypes?.find((v) => v.id === vehicleTypeId)?.localeName ??
        "";
  }

  getVehicleTypes(vehicleTypeId?: number) {
    
    this.subs.add(
      this.corporateVehicleService
        .getVehicleTypes({suspended: false})
        .subscribe(
          (vehicleTypes: BaseResponse<VehicleType>) => {
            if (vehicleTypes.content?.length > 0) {
              this.vehicleTypes = vehicleTypes.content;
              this.getVehicleTypeName(vehicleTypeId);
            } else {
              this.translate
                .get(["error.noVehicleTypesFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  convertAssetPoliciesToNames(assetPolicies?: AssetPolicy[]) {
    if (assetPolicies.length > 0) {
      const policyIds = assetPolicies.map((assetPolicy) => {
        return assetPolicy.policyId;
      });
      this.getPolicies(this.corporateId, policyIds);
    }
  }

  getPolicies(corporateId: number, ids: number[]) {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(corporateId, {assetType: AssetType.Vehicle, ids})
        .subscribe(
          (policies: Policy[]) => {
            if (policies["content"]?.length > 0) {
              this.policies = policies["content"];
              this.corporateVehicle["assetPolicies"] = this.policies?.map(
                (p) => this.currentLang == "en" ? p.enName : p.localeName
              );
            } else {
              this.translate
                .get(["error.noPoliciesFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateOuDetails(ouId: number) {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            this.corporateOuService.setOuName(this.corporateVehicle, this.corporateOu, this.currentLang);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateNfc(nfcId?: number) {
    
    this.subs.add(
      this.nfcTagService.getNfcTag(this.corporateId, nfcId).subscribe(
        (nfcTag: NfcTag) => {
          if (nfcTag) {
            this.corporateVehicle["tagNumber"] = nfcTag.serialNumber;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  convertAuthrizedUsersToNames(corporateId: number, userIds: number[]) {
    if (userIds.length > 0) {
      
      this.subs.add(
        this.corporateUserService
          .getCorporateUsers(corporateId, {userIds: userIds})
          .subscribe(
            (corporateUsers) => {
              if (corporateUsers.content?.length > 0) {
                this.corporateUsers = corporateUsers.content;
                this.corporateVehicle["authorizedUsers"] =
                  this.currentLang === "en"
                    ? corporateUsers.content.map((u) => u.enName)
                    : corporateUsers.content.map((u) => u.localeName);
              } else {
                this.translate
                  .get(["error.noUsersFound", "type.warning"])
                  .subscribe((res) => {
                    this.toastr.warning(
                      Object.values(res)[0] as string,
                      Object.values(res)[1] as string
                    );
                  });
              }
              
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  getCity(cityId: number) {
    
    this.subs.add(
      this.cityService.getCity(1, cityId).subscribe(
        (city) => {
          if (city) {
            this.city = city;
            this.corporateVehicle["originCity"] =
              this.currentLang === "en" ? city?.enName : city?.localeName;
          } else {
            this.translate
              .get(["error.noCityFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getVehicleConsumptionRates(vehicleId: number, plateNumber: string, minCr: number, maxCr: number) {
    const date = `${this.selectedMonth}-${this.date.getDay()} ${this.date.getHours()}:${this.date.getMinutes()}:${this.date.getSeconds()}`
    this.subs.add(
      this.corporateVehicleService.getVehicleConsumptionRates(vehicleId,date).subscribe(
        (consumnptionRates) => {
          if (consumnptionRates.content?.length > 0) {
            let data :any[] = [{
              name: plateNumber, 
              series: consumnptionRates.content.map((item) => {
                let date = new Date(item.modifiedDate).getDate() + "/"+new Date(item.modifiedDate).getMonth() + "/" +new Date(item.modifiedDate).getFullYear();
                return {
                  name: date,
                  value: item.consumptionRate,
                  min: minCr,
                  max:maxCr
                };
              })
            }];
            this.vehicleConsumnptionRates = data;
           } else {
            this.vehicleConsumnptionRates=[]

            // this.translate
            //   .get(["error.noConsumptionRatesFound", "type.warning"])
            //   .subscribe((res) => {
            //     this.toastr.warning(
            //       Object.values(res)[0] as string,
            //       Object.values(res)[1] as string
            //     );
            //   });
          }
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  changeGraph(){
      const date = `${this.selectedMonth}-${this.date.getDay()} ${this.date.getHours()}:${this.date.getMinutes()}:${this.date.getSeconds()}`;
      this.subs.add(
        this.corporateVehicleService.getVehicleConsumptionRates(this.corporateVehicle.assetId,date).subscribe(
          (consumnptionRates) => {
            if (consumnptionRates.content?.length > 0) {
              let data :any[] = [{
                name: this.corporateVehicle.plateNumber, 
                series: consumnptionRates.content.map((item) => {
                  let date = new Date(item.modifiedDate).getDate() + "/"+new Date(item.modifiedDate).getMonth() + "/" +new Date(item.modifiedDate).getFullYear();
                  return {
                    name: date,
                    value: item.consumptionRate,
                    min: this.corporateVehicle.consumptionLowRate,
                    max:this.corporateVehicle.consumptionHighRate
                  };
                })
              }];
              this.vehicleConsumnptionRates = data;
             } else {
              this.vehicleConsumnptionRates=[]

            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );

  }

  onResize(event) {
    this.view = [event, 320]
}

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
