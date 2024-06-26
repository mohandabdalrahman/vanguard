import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AssetType} from "@models/asset-type";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {ProductCategory} from "app/admin/product/product-category.model";
import {ProductCategoryService} from "app/admin/product/productCategory.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {
  ApplyTime,
  CorporatePolicy,
  Limit,
  PolicyCycleType,
  PolicyType,
  WorkingDays,
} from "../corporate-policy.model";
import {CorporatePolicyService} from "../corporate-policy.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {formatDate, parseDate} from "@helpers/format-date";
import {City} from "app/admin/cities/city.model";
import {Zone} from "app/admin/zones/zone.model";
import {CityService} from "app/admin/cities/city.service";
import {ZoneService} from "app/admin/zones/zone.service";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {CorporateOu, OuNode} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";

@Component({
  selector: "app-update-corporate-policy",
  templateUrl: "./update-corporate-policy.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "../create-corporate-policy/create-corporate-policy.component.scss",
  ],
})
export class UpdateCorporatePolicyComponent implements OnInit, OnDestroy {
  @ViewChild("corporatePolicyForm") submitForm: NgForm;
  private subs = new SubSink();
  active = true;
  corporateId: number;
  corporatePolicyId: number;
  corporatePolicy = new CorporatePolicy();
  productCategories: ProductCategory[] = [];
  userType: string;
  assetTypes: AssetType[] = Object.keys(AssetType).map((key) => AssetType[key]);
  policyTypes = Object.keys(PolicyType).map((key) => {
    return {
      value: PolicyType[key],
    };
  });

  policyCycleTypes = Object.keys(PolicyCycleType).map((key) => {
    return {
      value: PolicyCycleType[key],
    };
  });
  limitModes = Object.keys(Limit).map((key) => {
    return {
      value: Limit[key],
    };
  });
  workingDays = Object.keys(WorkingDays).map((key) => {
    return {
      value: WorkingDays[key],
    };
  });
  ApplyTimes = Object.keys(ApplyTime).map((key) => {
    return {
      value: ApplyTime[key],
    };
  });
  limitMode = Limit.limit;
  amount = false;
  limitPerTransaction = false;
  limitPerDay = false;
  limitByLocation = false;
  maxNumberOfTransactionPerDay = false;
  maxNumberOfTransactionPerCycle = false;
  validity = false;
  customCycleDays = false;
  cities: City[] = [];
  zones: Zone[] = [];
  countryId: number;
  productCategory: ProductCategory;
  currentLang: string;
  isTabView = false;
  detailsUrl: string;
  ouId: number;
  corporateOu: CorporateOu;
  selectedOuNode: OuNode;
  shouldDisplay = false

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private productCategoryService: ProductCategoryService,
    private corporatePolicyService: CorporatePolicyService,
    private zoneService: ZoneService,
    private cityService: CityService,
    private authService: AuthService,
    private corporateService: CorporateService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    public corporateOuService: CorporateOuService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"];
    this.selectedOuNode = this.corporateOuService?.selectedOuNode || JSON.parse(sessionStorage.getItem('selectedOuNode'));
    if (this.isTabView) {
      const lastIndex = -2;
      this.detailsUrl = this.router.url.split("/").slice(0, lastIndex).join("/");
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
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
        this.corporatePolicyId = params["corporatePolicyId"];
      })
    );
    if (!this.authService.isOuEnabled()) {
      this.corporateOuService.selectedOuNode = null
    }
    this.getCorporate();
  }

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.countryId = corporate.countryId;
            this.getProductCategories();
            this.getCities(corporate.countryId);

            if (this.corporatePolicyId && this.corporateId) {
              this.getCorporatePolicy();
            }
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getProductCategories() {
    
    this.subs.add(
      this.productCategoryService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
          } else {
            this.translate
              .get(["error.noProductCategoriesFound", "type.warning"])
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

  getCorporatePolicy() {
    
    this.subs.add(
      this.corporatePolicyService
        .getCorporatePolicy(this.corporateId, this.corporatePolicyId)
        .subscribe(
          (corporatePolicy) => {
            if (corporatePolicy) {
              this.shouldDisplay = true
              corporatePolicy.cities && corporatePolicy.cities.length > 0
                ? this.getZones(this.countryId, corporatePolicy.cities)
                : null;
              this.corporatePolicy = corporatePolicy;
              this.ouId = corporatePolicy.ouId;
              this.corporatePolicy.startDate = corporatePolicy?.startDate
                ? parseDate(corporatePolicy?.startDate.split(" ")[0])
                : null;
              this.corporatePolicy.endDate = corporatePolicy?.endDate
                ? parseDate(corporatePolicy?.endDate.split(" ")[0])
                : null;
              this.active = !this.corporatePolicy.suspended;
              this.amount = !!(
                corporatePolicy.amount || corporatePolicy.amount === 0
              );
              this.limitPerDay = !!(
                corporatePolicy.limitPerDay || corporatePolicy.limitPerDay === 0
              );
              this.limitPerTransaction = !!(
                corporatePolicy.limitPerTransaction ||
                corporatePolicy.limitPerTransaction === 0
              );
              this.limitMode =
                this.amount || this.limitPerDay || this.limitPerTransaction
                  ? Limit.limit
                  : Limit.noLimit;
              this.maxNumberOfTransactionPerCycle = !!(
                corporatePolicy.maxNumberOfTransactionPerCycle ||
                corporatePolicy.maxNumberOfTransactionPerCycle === 0
              );
              this.maxNumberOfTransactionPerDay = !!(
                corporatePolicy.maxNumberOfTransactionPerDay ||
                corporatePolicy.maxNumberOfTransactionPerDay === 0
              );
              if (this.ouId && (this.authService.isAdminCorporateOuEnabled() || this.authService.isOuEnabled())) {
                this.getCorporateOuDetails(this.ouId);
              }
              if (corporatePolicy.productCategoryId) {
                this.productCategory = this.productCategories.find(
                  (x) => x.id === corporatePolicy.productCategoryId
                );
              }
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

  updateCorporatePolicy() {
    if (this.corporatePolicy.startDate && this.corporatePolicy.endDate) {
      this.corporatePolicy.startDate = formatDate(
        this.corporatePolicy.startDate
      );
      this.corporatePolicy.endDate = formatDate(this.corporatePolicy.endDate);
    }
    this.corporatePolicy.suspended = !this.active;
    this.corporatePolicy.ouId = this.ouId;
    // dynamic policy type
    if (this.corporatePolicy.policyType === PolicyType.daily) {
      this.corporatePolicy.assetType = AssetType.Vehicle;
      this.corporatePolicy.skipMileage = false;
      this.corporatePolicy.applyTime = ApplyTime.immediate;
      this.corporatePolicy.policyType = 'DYNAMIC';
    }
    if (this.submitForm.valid && this.corporateId && this.corporatePolicyId) {
      if (this.limitMode === "NO_LIMIT") {
        this.corporatePolicy.amount = null;
        this.corporatePolicy.limitPerDay = null;
        this.corporatePolicy.limitPerTransaction = null;
      }
      
      this.subs.add(
        this.corporatePolicyService
          .updateCorporatePolicy(
            this.corporateId,
            this.corporatePolicyId,
            this.corporatePolicy
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporatePolicyId);
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

  // get zones
  getZones(countryId: number, citiesIds: number[]) {
    if (countryId && citiesIds && citiesIds.length > 0) {
      
      this.subs.add(
        this.zoneService
          .getZones({citiesIds: citiesIds, countryId})
          .subscribe(
            (zones) => {
              if (zones.content?.length > 0) {
                this.zones = zones.content;
              } else {
                this.zones = [];
                this.translate
                  .get(["error.noZoneFound", "type.warning"])
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
    } else {
      this.corporatePolicy.zones = [];
    }
  }

  getCities(countryId: number) {
    if (countryId) {
      
      this.subs.add(
        this.cityService.getCities(countryId).subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content?.length > 0) {
              this.cities = cities.content;
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
    } else {
      console.error("no country id provided");
    }
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

  handleSuccessResponse(msg: string, policyId: number) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "policies",
        policyId,
        "details",
      ]);
    } else {
      this.router.navigate(this.isTabView ? [this.detailsUrl, policyId, "details"] : ["/corporate", "policies", policyId, "details"]);
    }
    this.toastr.success(msg);
  }

  toggle(checked: boolean, name: string) {
    this[name] = checked;
    if (!this[name]) {
      this.corporatePolicy[name] = null;
    }
  }

  selectAll(values: string[]) {
    if (values.includes("selectAll")) {
      const selected = this.workingDays.map((item) => item.value);
      this.submitForm.form.controls["workingDays"].patchValue(selected);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public readonly PolicyType = PolicyType;
}
