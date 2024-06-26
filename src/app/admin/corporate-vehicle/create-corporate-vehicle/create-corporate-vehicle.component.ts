import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AssetTag} from "@models/asset-tag";
import {Policy, PolicyType} from "@models/policy.model";
import {BaseResponse} from "@models/response.model";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {ErrorService} from "@shared/services/error.service";
import {PolicyService} from "@shared/services/policy.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateVehicle, FuelType, VehicleType,} from "../corporate-vehicle.model";
import {CorporateVehicleService} from "../corporate-vehicle.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {NfcTagService} from "@shared/services/nfc-tag.service";
import {NfcTag} from "@models/nfc-tag.model";
import {AssetType} from "@models/asset-type";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {CorporateUserService} from "app/admin/corporate-user/corporate-user.service";
import {User} from "@models/user.model";
import {CorporateService} from "../../corporates/corporate.service";
import {Corporate} from "../../corporates/corporate.model";
import {City} from "app/admin/cities/city.model";
import {CityService} from "app/admin/cities/city.service";
import {formatDate, parseDate} from "@helpers/format-date";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {CorporateOu, OuNode} from "../../organizational-chart/corporate-ou.model";
import {removeNullProps} from "@helpers/check-obj";
import {AssetTypeService} from "@shared/services/asset-type.service";
import {AlertableDataDto} from "@models/alertable-data.model";

@Component({
  selector: "app-create-corporate-vehicle",
  templateUrl: "./create-corporate-vehicle.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-vehicle.component.scss",
  ],
})
export class CreateCorporateVehicleComponent implements OnInit, OnDestroy {
  @ViewChild("corporateVehicleForm") submitForm: NgForm;
  @ViewChild("autoInput") input;
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateVehicle = new CorporateVehicle();
  corporateId: number;
  countryId: number;
  corporateVehicleId: number;
  active = true;
  assetTags: AssetTag[] = [];
  corporateNfcs: NfcTag[] = [];
  vehicleTypes: VehicleType[] = [];
  corporateUsers: User[] = [];
  policies: Policy[] = [];
  tempPolicies: Policy[] = [];
  dynamicPolicies: Policy[] = [];
  policyIds: number[] = [];
  userType: string;
  assetTagName: string;
  currentLang: string;
  cities: City[] = [];
  isTabView = false;
  detailsUrl: string;
  ouId: number;
  nextDay = new Date();
  nextDayISOFormat: string;
  corporateOu: CorporateOu
  selectedOuNode: OuNode;
  brakeLining = true;
  motorRunning = true;
  oilFilter = true;
  adaptiveFilter = true;
  oil = true;
  tires = true;
  dynamicPoliciesNames: string;
  allUserAuth:Boolean=false;
  constructor(
    private route: ActivatedRoute,
    private corporateVehicleService: CorporateVehicleService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private corporateUserService: CorporateUserService,
    private policyService: PolicyService,
    private nfcTagService: NfcTagService,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateService: CorporateService,
    private cityService: CityService,
    public corporateOuService: CorporateOuService,
    private assetTypeService: AssetTypeService,
  ) {
  }

  fuelTypes = Object.keys(FuelType).map((key) => {
    return {
      value: FuelType[key],
    };
  });

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.isTabView = this.route.snapshot.data["isTabView"];
    this.selectedOuNode = this.corporateOuService?.selectedOuNode || JSON.parse(sessionStorage.getItem('selectedOuNode'));
    if (this.isTabView) {
      const lastIndex = this.isUpdateView ? -2 : -1;
      this.detailsUrl = this.router.url
        .split("/")
        .slice(0, lastIndex)
        .join("/");
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.dynamicPoliciesNames = this.dynamicPolicies.length ? this.dynamicPolicies.map(policy => this.currentLang === 'en' ? policy.enName : policy.localeName).join(', ') : null;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.router.url.includes('organizational-chart/units')) {
          this.ouId = +getRelatedSystemId(params, "ouId");
        } else if (this.authService.getUserType() === 'admin') {
          this.ouId = (this.authService.isAdminCorporateOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getRootOuId();
        } else {
          this.ouId = (this.authService.isOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getOuId();
        }
      }),
      this.route.params.subscribe((params) => {
        this.corporateVehicleId = params["corporateVehicleId"];
      })
    );
    if (this.isUpdateView && this.corporateVehicleId && this.corporateId) {
      this.getCorporateVehicle();
    }
    this.getCorporate(this.corporateId);
    this.getAssetTags(this.corporateId);
    this.getCorporateCards(this.corporateId);
    if (!this.isUpdateView) {
      this.getCorporateUsers(this.corporateId);
      this.getPolicies(this.corporateId, AssetType.Vehicle);
    }
    this.getVehicleTypes();
    if (!this.authService.isOuEnabled()) {
      this.corporateOuService.selectedOuNode = null
    }
    this.getAlertableDataFields()
  }

  createCorporateVehicle() {
    this.removeEmptyAlertableObj();
    this.corporateVehicle.suspended = !this.active;
    this.corporateVehicle.ouId = this.ouId;
    if (this.corporateVehicle.licenseExpiryDate) {
      this.corporateVehicle.licenseExpiryDate = formatDate(this.corporateVehicle.licenseExpiryDate)
    } else {
      this.corporateVehicle.licenseExpiryDate = null
    }
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.convertPolicyIdsToAssetPolicies();
    if (this.submitForm.valid && this.corporateId) {
      this.subs.add(
        this.corporateVehicleService
          .createCorporateVehicle(this.corporateId, this.corporateVehicle)
          .subscribe(
            (vehicle) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, vehicle.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }


  private removeEmptyAlertableObj() {
    this.corporateVehicle.alertableData = this.corporateVehicle.alertableData.filter(item => item.claimingDistance || item.claimingNumberOfDays).map(item => {
      return {
        ...item,
        id: null
      }
    })
  }

  updateCorporateVehicle() {
    this.removeEmptyAlertableObj();
    this.corporateVehicle.suspended = !this.active;
    this.corporateVehicle.ouId = this.ouId;
    if (this.corporateVehicle.licenseExpiryDate) {
      this.corporateVehicle.licenseExpiryDate = `${this.corporateVehicle.licenseExpiryDate?.split("-").reverse().join("-")} 00:00:00`
    } else {
      this.corporateVehicle.licenseExpiryDate = null
    }
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.policyIds = [...this.policyIds, ...this.dynamicPolicies.map(policy => policy.id)];
    this.convertPolicyIdsToAssetPolicies();
    if (this.submitForm.valid && this.corporateId && this.corporateVehicleId) {
      this.subs.add(
        this.corporateVehicleService
          .updateCorporateVehicle(
            this.corporateId,
            this.corporateVehicleId,
            this.corporateVehicle
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporateVehicle.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  getCorporateVehicle() {
    this.nextDay = new Date();
    
    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicle(this.corporateId, this.corporateVehicleId, true)
        .subscribe(
          (corporateVehicle) => {
            if (corporateVehicle) {
              this.corporateVehicle = corporateVehicle;
              this.ouId = corporateVehicle.ouId;
              this.corporateVehicle.licenseExpiryDate = corporateVehicle?.licenseExpiryDate
                ? parseDate(corporateVehicle?.licenseExpiryDate.split(" ")[0])
                : null;
              const licenseDate = new Date(this.corporateVehicle.licenseExpiryDate)
              this.nextDay = new Date(licenseDate.getFullYear(), licenseDate.getMonth(), licenseDate.getDate() + 2);
              this.nextDayISOFormat = this.nextDay.toISOString().split('T')[0];
              this.getCorporateUsers(this.corporateId);
              this.getPolicies(this.corporateId, AssetType.Vehicle);
              this.getCorporateNfc(corporateVehicle.nfcId);
              this.convertAssetPoliciesToIds();
              this.active = !this.corporateVehicle.suspended;
              if (corporateVehicle.assetTagId) {
                this.getAssetTag(this.corporateId, corporateVehicle.assetTagId);
              }
              if (this.ouId && (this.authService.isAdminCorporateOuEnabled() || this.authService.isOuEnabled())) {
                this.getCorporateOuDetails(this.ouId);
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

  getCorporate(corporateId: number) {
    
    this.subs.add(
      this.corporateService.getCorporate(corporateId).subscribe(
        (corporate: Corporate) => {
          if (corporate) {
            this.countryId = corporate.countryId;
            this.getCities(this.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCities(countryId: number) {
    if (countryId) {
      
      this.subs.add(
        this.cityService.getCities(countryId).subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content?.length > 0) {
              this.cities = cities.content;
            } else {
              this.cities = [];
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
  }

  getCorporateNfc(nfcId?: number) {
    
    this.subs.add(
      this.nfcTagService.getNfcTag(this.corporateId, nfcId).subscribe(
        (nfcTag: NfcTag) => {
          if (nfcTag) {
            this.corporateNfcs.push(nfcTag);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getAssetTags(corporateId: number) {
    
    this.subs.add(
      this.assetTagService
        .getAssetTags(corporateId, {suspended: false})
        .subscribe(
          (assetTags: BaseResponse<AssetTag>) => {
            if (assetTags.content?.length > 0) {
              this.assetTags = assetTags.content;
            } else {
              //this.toastr.warning("No asset tags found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getAssetTag(corporateId: number, id: number) {
    
    this.subs.add(
      this.assetTagService.getAssetTag(corporateId, id).subscribe(
        (assetTag: AssetTag) => {
          if (assetTag) {
            this.assetTagName = assetTag.enName;
          } else {
            //this.toastr.warning("No asset tags found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporateCards(corporateId: number) {
    
    this.subs.add(
      this.nfcTagService
        .getNfcTags(corporateId, {suspended: false, assigned: false})
        .subscribe(
          (corporateCards: BaseResponse<NfcTag>) => {
            if (corporateCards.content?.length > 0) {
              this.corporateNfcs = corporateCards.content;
            } else {
              this.translate
                .get(["error.noNfcsFound", "type.warning"])
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

  getVehicleTypes() {
    
    this.subs.add(
      this.corporateVehicleService
        .getVehicleTypes({suspended: false})
        .subscribe(
          (vehicleTypes: BaseResponse<VehicleType>) => {
            if (vehicleTypes.content?.length > 0) {
              this.vehicleTypes = vehicleTypes.content;
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

  getCorporateUsers(corporateId: number) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(corporateId, removeNullProps({suspended: false, ouId: this.ouId ? this.ouId : null}))
        .subscribe(
          (corporateUsers) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content.filter(
                (u) => u.nfcIds.length > 0
              );
              //   check authorizedUserIds array in corporateUsers
              this.corporateVehicle.authorizedUserIds =
                this.corporateVehicle.authorizedUserIds?.filter((id) =>
                  this.corporateUsers.find((u) => u.id === id)
                );
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

  getPolicies(corporateId: number, assetType: AssetType) {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(corporateId, removeNullProps({
          assetType,
          isExpired: false,
          suspended: false,
          ouIds: this.ouId ? this.ouId : null,
        }))
        .subscribe(
          (policies: Policy[]) => {
            if (policies["content"]?.length > 0) {
              this.tempPolicies = policies["content"];
              this.policies = policies["content"].filter((policy: { policyType: PolicyType; }) => policy.policyType !== PolicyType.dynamic);
              this.findDynamicPolicies();
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

  findDynamicPolicies() {
    const vehiclePolicies = this.tempPolicies.filter(policy => this.policyIds.includes(policy.id));
    this.dynamicPolicies = vehiclePolicies.filter(policy => policy.policyType === PolicyType.dynamic);
    this.policyIds = this.policyIds.filter(id => !this.dynamicPolicies.find(policy => policy.id === id));

    this.dynamicPoliciesNames = this.dynamicPolicies.length ? this.dynamicPolicies.map(policy => this.currentLang === 'en' ? policy.enName : policy.localeName).join(', ') : null;
  }

  convertPolicyIdsToAssetPolicies() {
    this.corporateVehicle.assetPolicies = this.policyIds.map((id) => {
      return {policyId: id};
    });
  }

  convertAssetPoliciesToIds() {
    if (this.corporateVehicle.assetPolicies.length > 0) {
      this.policyIds = this.corporateVehicle.assetPolicies.map(
        (assetPolicy) => {
          return assetPolicy.policyId;
        }
      );
    }
  }

  createAssetTag() {
    const assetTagName = this.input.nativeElement.value;
    this.subs.add(
      this.assetTagService
        .createAssetTag(this.corporateId, assetTagName)
        .subscribe(
          (assetTag: AssetTag) => {
            this.corporateVehicle.assetTagId = assetTag.id;
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
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  findAssetTagId(value: string) {
    if (value) {
      this.corporateVehicle.assetTagId = this.assetTags.find(
        (asset) => asset.enName === value
      )?.id;
    }
  }

  handleSuccessResponse(msg: string, vehicleId: number) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "vehicles",
        vehicleId,
        "details",
        "main-info"
      ]);
    } else {
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, vehicleId, "details", "main-info"]
          : ["/corporate", "vehicles", vehicleId, "details", 'main-info']
      );
    }
    this.toastr.success(msg);
  }


  getAlertableDataFields() {
    
    this.subs.add(
      this.assetTypeService.getAlertableDataFields().subscribe(
        (alertableData: AlertableDataDto[]) => {
          if (alertableData) {
            this.corporateVehicle.alertableData = alertableData.map(item => {
              const found = this.corporateVehicle?.alertableData?.find(i => i.alertableDataId === item.id)
              if (found) {
                return {
                  ...item,
                  alertableDataId: item.id,
                  alerteableFieldEnName: found.alerteableFieldEnName,
                  alerteableFieldLocaleName: found.alerteableFieldLocaleName,
                  claimingDistance: found.claimingDistance,
                  claimingNumberOfDays: found.claimingNumberOfDays,
                  lastChangedDate: found.lastChangedDate,
                  lastChangedReadingDistance: found.lastChangedReadingDistance,
                  productCategoryId: found.productCategoryId,
                  id:found.id
                }
              } else {
                return {
                  ...item,
                  alertableDataId: item.id,
                  alerteableFieldEnName: item.enName,
                  alerteableFieldLocaleName: item.localeName,
                  claimingDistance: null,
                  claimingNumberOfDays: null,
                  lastChangedDate: null,
                  lastChangedReadingDistance: null,
                  productCategoryId: item.productCategoryId
                }
              }

            })


            // this.corporateVehicle.alertableData = alertableData.map(item=>{
            //   return {
            //     alertableDataId: item.id,
            //     alerteableFieldEnName: item.enName,
            //     alerteableFieldLocaleName: item.localeName,
            //     claimingDistance: null,
            //     claimingNumberOfDays: null,
            //     lastChangedDate: null,
            //     lastChangedReadingDistance: null,
            //     productCategoryId: item.productCategoryId
            //   }
            // })
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  toggle(checked: boolean, name: string) {
    this.corporateVehicle.allUsersAuthorized=!checked
    this[name] = !checked;
    if(!this.corporateVehicle.allUsersAuthorized){
      this.corporateVehicle.authorizedUserIds=[]
    }
    
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  protected readonly String = String;
}
