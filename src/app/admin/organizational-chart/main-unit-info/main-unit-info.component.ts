import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {CorporateOu, PolicyCountResponseDto} from "../corporate-ou.model";
import {SubSink} from "subsink";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {CorporateOuService} from "../corporate-ou.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ActivatedRoute} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {ProductCategory} from "../../product/product-category.model";
import {ProductCategoryService} from "../../product/productCategory.service";
import {CorporateService} from "../../corporates/corporate.service";
import {CityService} from "../../cities/city.service";
import {City} from "../../cities/city.model";
import {PolicyType} from "../../corporate-policy/corporate-policy.model";
import {CorporateOuAdmins, OuRoleUserNamesDto} from "@models/user.model";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {AssetType} from "@models/asset-type";
import {AssetPolicyService} from "@shared/services/asset-policy.service";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {RoleTag} from "../../user-roles/user-role.model";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: "app-main-unit-info",
  templateUrl: "./main-unit-info.component.html",
  styleUrls: ["./main-unit-info.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MainUnitInfoComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("adminUsersModal") private adminUsersModal: ModalComponent;

  ouId: number;
  corporateId: number;
  corporateOu = new CorporateOu();
  currentLang: string;
  productCategories: ProductCategory[] = [];
  city: City;
  policyType: PolicyType;
  restAdminUsers: OuRoleUserNamesDto[] = [];
  rootUtl = ''
  trees = [];
  corporateOuChildren: number[] = [];
  assetObj: { USER: number; CONTAINER: number; VEHICLE: number };
  usersCount: number;
  policyCount: PolicyCountResponseDto;
  corporateOuAdmins: CorporateOuAdmins[] = [];
  userType: string;

  constructor(
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    public corporateOuService: CorporateOuService,
    private route: ActivatedRoute,
    private productCategoryService: ProductCategoryService,
    private corporateService: CorporateService,
    private cityService: CityService,
    private assetPolicyService: AssetPolicyService,
    private corporateUserService: CorporateUserService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.trees = this.productCategories.map((product) =>
        this.currentLang === "en" ? product.enName : product.localeName
        );
      }),
      this.route.params.subscribe((params) => {
        this.ouId = params["ouId"];
      }),
      this.corporateOuService.restAdminUsers$.subscribe((restAdminUsers) => {
        this.showRestAdminUsers(restAdminUsers);
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
      );
    this.rootUtl = this.userType === 'corporate' ? '/corporate/organizational-chart/units/' : '/admin/corporates/'+this.corporateId+'/organizational-chart/units'
    this.getCorporateAssetCount();
    this.getCorporatesUsersCount();
    this.getPolicyCount();
    this.getCorporateOuAdmins();
    this.getCorporateOuDetails();
    this.getCorporateOuChildren();
  }

  getCorporateOuDetails() {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, this.ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            if (corporateOu.allowedProductCategoryIds?.length > 0) {
              this.getProductCategories(corporateOu.allowedProductCategoryIds);
            }
            if (corporateOu.cityId) {
              this.getCorporate(corporateOu.cityId);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporate(cityId: number): void {
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.getCity(corporate.countryId, cityId);
          }
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCity(countryId: number, cityId: number) {
    this.subs.add(
      this.cityService.getCity(countryId, cityId).subscribe(
        (city) => {
          if (city) {
            this.city = city;
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

  getProductCategories(productIds: number[]) {
    this.subs.add(
      this.productCategoryService.getProducts({ids: productIds}).subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
            this.trees = this.productCategories.map((product) =>
              this.currentLang === "en" ? product.enName : product.localeName
            );
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

  getCorporateOuChildren() {
    this.subs.add(
      this.corporateOuService
        .getCorporateOuChildren(this.corporateId, this.ouId)
        .subscribe(
          (corporateOuChildren: number[]) => {
            if (corporateOuChildren.length > 0) {
              this.corporateOuChildren = corporateOuChildren;
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateAssetCount(): void {
    
    this.subs.add(
      this.assetPolicyService
        .getCorporateAssetCount(this.corporateId, {
          ouIds: [this.ouId],
          types: ["USER", "HARDWARE", "VEHICLE", "CONTAINER"],
        })
        .subscribe(
          (assetCounts) => {
            if (assetCounts.length) {
              assetCounts.forEach((obj) => {
                this.assetObj = {
                  [AssetType.User]: obj.assetCounts[AssetType.User],
                  [AssetType.Container]: obj.assetCounts[AssetType.Container],
                  [AssetType.Vehicle]: obj.assetCounts[AssetType.Vehicle],
                };
              });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporatesUsersCount(): void {
    
    this.subs.add(
      this.corporateUserService
        .getCorporatesUsersCount(this.corporateId, {
          ouIds: [this.ouId],
        })
        .subscribe(
          (userCounts) => {
            if (userCounts.length) {
              this.usersCount = userCounts[0].count;
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getPolicyCount(): void {
    
    this.subs.add(
      this.corporateOuService
        .getPolicyCount(this.corporateId, [this.ouId])
        .subscribe(
          (policyCount) => {
            if (policyCount) {
              this.policyCount = policyCount;
            }
            
          },
          (err) => {
            this.corporateOuService.setPolicyCount(null);
            if (
              err?.includes("Backend returned code 404: No Policies found.")
            ) {
              this.translate.get(["errorCode.POL_NF"]).subscribe((res) => {
                this.toastr.warning(Object.values(res)[0] as string);
              });
            } else {
              this.errorService.handleErrorResponse(err);
            }
          }
        )
    );
  }

  getCorporateOuAdmins(): void {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateOuAdmins(this.corporateId, RoleTag.OU_ADMIN, {
          ouIds: [this.ouId],
        })
        .subscribe(
          (corporateOuAdmins) => {
            if (corporateOuAdmins) {
              this.corporateOuAdmins = corporateOuAdmins[this.ouId];
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  showRestAdminUsers(restAdminUsers) {
    // remove first user
    this.restAdminUsers = restAdminUsers.slice(1);
    this.adminUsersModal.open();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
