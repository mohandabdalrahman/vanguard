import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {formatDate} from "@helpers/format-date";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetType} from "@models/asset-type";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {City} from "app/admin/cities/city.model";
import {CityService} from "app/admin/cities/city.service";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {CategoryTag, ProductCategory} from "app/admin/product/product-category.model";
import {ProductCategoryService} from "app/admin/product/productCategory.service";
import {Zone} from "app/admin/zones/zone.model";
import {ZoneService} from "app/admin/zones/zone.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {AuthService} from "../../../auth/auth.service";
import {ApplyTime, CorporatePolicy, Limit, PolicyCycleType, PolicyType, WorkingDays,} from "../corporate-policy.model";
import {CorporatePolicyService} from "../corporate-policy.service";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {OuNode} from "../../organizational-chart/corporate-ou.model";
import {NgForm} from "@angular/forms";

@Component({
  selector: "app-create-corporate-policy",
  templateUrl: "./create-corporate-policy.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-policy.component.scss",
  ],
})
export class CreateCorporatePolicyComponent implements OnInit, OnDestroy {
  @ViewChild("corporatePolicyForm") submitForm: NgForm;
  private subs = new SubSink();
  active = true;
  corporateId: number;
  corporatePolicyId: number;
  corporatePolicy = new CorporatePolicy();
  productCategories: ProductCategory[] = [];
  tempProductCategories: ProductCategory[] = [];
  userType: string;
  zonesIds: number[];
  citiesIds: number[];
  currentLang: string;

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
  limitModes = Object.keys(Limit).map((key) => {
    return {
      value: Limit[key],
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
  isTabView = false;
  detailsUrl: string;
  ouId: number;
  selectedOuNode: OuNode;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private productService: ProductCategoryService,
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
      const lastIndex = -1;
      this.detailsUrl = this.router.url
        .split("/")
        .slice(0, lastIndex)
        .join("/");
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
    this.corporatePolicy.policyType = PolicyType.oneTime;
  }

  createCorporatePolicy() {
    this.corporatePolicy.suspended = !this.active;
    this.corporatePolicy.corporateId = this.corporateId;

    if (this.ouId) {
      this.corporatePolicy.ouId = this.ouId;
    }

    if (this.limitMode === Limit.noLimit) {
      this.resetInputs(["amount", "limitPerDay", "limitPerTransaction"]);
    }
    if (this.corporatePolicy.policyType !== "RECURRING") {
      this.resetInputs(["numberOfCycle"]);
    }
    // dynamic policy type
    if (this.corporatePolicy.policyType === PolicyType.daily) {
      this.corporatePolicy.assetType = AssetType.Vehicle;
      this.corporatePolicy.skipMileage = false;
      this.corporatePolicy.applyTime = ApplyTime.immediate;
      this.corporatePolicy.policyType = 'DYNAMIC';
    }

    if (
      this.corporatePolicy.policyType === "RECURRING" &&
      this.corporatePolicy.policyCycleType === "DAILY"
    ) {
      this.resetInputs(["maxNumberOfTransactionPerDay"]);
    }

    if (this.corporatePolicy.policyType === "RECURRING") {
      this.resetInputs(["startDate", "endDate"]);
    }

    const startDate = this.corporatePolicy.startDate;
    const endDate = this.corporatePolicy.endDate;

    if (this.corporatePolicy.startDate && this.corporatePolicy.endDate) {
      this.corporatePolicy.startDate = formatDate(
        this.corporatePolicy.startDate
      );
      this.corporatePolicy.endDate = formatDate(this.corporatePolicy.endDate);
    }
    if (this.corporatePolicy.assetType !== AssetType.Vehicle) {
      this.corporatePolicy.skipMileage = true;
    }
    if (this.submitForm.valid && this.corporateId) {
      
      this.subs.add(
        this.corporatePolicyService
          .createCorporatePolicy(this.corporateId, this.corporatePolicy)
          .subscribe(
            (policy) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, policy.id);
              });
            },
            (err) => {
              this.corporatePolicy.startDate = startDate;
              this.corporatePolicy.endDate = endDate;
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate
        .get(["error.fillMandatoryFields", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.countryId = corporate.countryId;
            this.getCities(corporate.countryId);
            if (this.ouId && (this.authService.isOuEnabled() || this.authService.isAdminCorporateOuEnabled())) {
              this.getProductCategoriesByOuId();
            } else {
              this.getProductCategories(corporate.countryId);
            }
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getProductCategories(countryId: number, productIds?: number[]) {
    
    this.subs.add(
      this.productService
        .getProducts({
          suspended: false,
          countryId: countryId,
          ...(productIds && {ids: productIds}),
        })
        .subscribe(
          (products: BaseResponse<ProductCategory>) => {
            if (products.content?.length > 0) {
              this.productCategories = products.content;
              this.tempProductCategories = products.content;
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

  getProductCategoriesByOuId() {
    this.subs.add(
      this.corporateOuService
        .getProductCategoriesIdsByOuId(this.corporateId, this.ouId)
        .subscribe(
          (productIds) => {
            if (productIds?.length) {
              this.getProductCategories(this.countryId, productIds);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  filterProductCategories() {
    if (this.corporatePolicy.policyType === PolicyType.daily) {
      this.corporatePolicy.productCategoryId = null;
      this.productCategories = this.productCategories.filter((product) => product.categoryTag === CategoryTag.fuel);
    } else {
      this.productCategories = this.tempProductCategories;
    }
  }

  // get zones
  getZones(countryId: number, cityIds: number[]) {
    if (countryId && cityIds.length > 0) {
      
      this.subs.add(
        this.zoneService
          .getZones({citiesIds: this.corporatePolicy.cities, countryId})
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
      console.error("no countryId or cityId provided");
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
    } else {
      console.error("no country id provided");
    }
  }

  toggle(checked: boolean, name: string) {
    this[name] = checked;
    if (!this[name]) {
      this.corporatePolicy[name] = null;
    }
  }

  resetInputs(inputs: string[]) {
    if (inputs.length > 0) {
      inputs.forEach((input) => {
        this.corporatePolicy[input] = null;
      });
    }
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
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, policyId, "details"]
          : ["/corporate", "policies", policyId, "details"]
      );
    }
    this.toastr.success(msg);
  }

  selectAll(values: string[]) {
    if (values.includes("selectAll")) {
      const selected = this.workingDays.map((item) => item.value);
      this.submitForm.form.controls["workingDays"].patchValue(selected);
    }
  }

  onClearAll() {
    this.submitForm.form.controls["workingDays"].patchValue([]);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public readonly PolicyType = PolicyType;
}
