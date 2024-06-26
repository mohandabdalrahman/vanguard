import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

import { ErrorService } from "@shared/services/error.service";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { CorporateOuService } from "../corporate-ou.service";
import { SubSink } from "subsink";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ActivatedRoute, Router } from "@angular/router";
import {
  BalanceDistributionMode,
  CorporateOu,
  OuTreeNode,
  OuType,
} from "../corporate-ou.model";
import { CorporateService } from "../../corporates/corporate.service";
import { BaseResponse } from "@models/response.model";
import { City } from "../../cities/city.model";
import { CityService } from "../../cities/city.service";
import { ProductCategory } from "../../product/product-category.model";
import { ProductCategoryService } from "../../product/productCategory.service";
import { NgForm } from "@angular/forms";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: "app-update-unit",
  templateUrl: "./update-unit.component.html",
  styleUrls: [
    "../create-unit/create-unit.component.scss",
    "./update-unit.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class UpdateUnitComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("unitForm") submitForm: NgForm;

  ouId: number;
  corporateId: number;
  corporateOu = new CorporateOu();
  ouNode = new OuTreeNode();
  parentOu = new CorporateOu();
  cities: City[] = [];
  currentLang: string;
  ouTypes = Object.keys(OuType).map((key) => {
    return {
      value: OuType[key],
    };
  });

  balanceDistributionModes = Object.keys(BalanceDistributionMode).map((key) => {
    return {
      value: BalanceDistributionMode[key],
    };
  });

  productCategories: ProductCategory[] = [];
  productCategoryIds: number[] = [];
  redirectUrl = "";
  childIsMain = false;
  isByLimit = false;
  childIsByBalance = false;
  userType: string;

  constructor(
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateOuService: CorporateOuService,
    private route: ActivatedRoute,
    private corporateService: CorporateService,
    private cityService: CityService,
    private productCategoryService: ProductCategoryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.corporateId = +getRelatedSystemId(null, "corporateId");
    this.userType = this.authService.getUserType()
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.ouId = +params["ouId"];
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    );
    this.redirectUrl = this.userType === "admin" ? "/admin/organizational-chart/units" : "/corporate/organizational-chart/units";
    if (this.corporateId && this.ouId) {
      this.getCorporateOuDetails();
      this.getCorporateOuHierarchy();
      this.getCorporate();
    }
  }

  getCorporateOuDetails() {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, this.ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            if (corporateOu.parentId) {
              this.getParentOu(corporateOu.parentId);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateOuHierarchy(): void {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (ouNode) => {
            if (ouNode) {
              this.ouNode = ouNode;
              this.checkChildOusTypeAndBalanceMode();
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getParentOu(parentId: number) {
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, parentId)
        .subscribe(
          (parentOu: CorporateOu) => {
            this.parentOu = parentOu;
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.getProductCategories(corporate.countryId);
            this.getCities(corporate.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getProductCategories(countryId: number) {
    
    this.subs.add(
      this.productCategoryService
        .getProducts({ suspended: false, countryId })
        .subscribe(
          (products: BaseResponse<ProductCategory>) => {
            if (products.content?.length > 0) {
              this.productCategories = products.content;
              this.productCategoryIds = this.productCategories
                .map((productCategory) => {
                  if (
                    this.corporateOu.allowedProductCategoryIds.includes(
                      productCategory.id
                    )
                  ) {
                    return productCategory.id;
                  }
                })
                .filter((productCategoryId) => productCategoryId !== undefined);
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

  selectAll(values: string[], name: string, formName: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this[formName].form.controls[name].patchValue(selected);
    }
  }

  updateCorporateOu() {
    this.setCorporateOuData();
    
    this.subs.add(
      this.corporateOuService
        .updateCorporateOu(this.corporateId, this.ouId, this.corporateOu)
        .subscribe(
          async () => {
            
            this.translate.get(["success.unitUpdated"]).subscribe((res) => {
              this.toastr.success(Object.values(res)[0] as string);
            });
            await this.router.navigateByUrl(`${this.redirectUrl}`);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  checkChildOusTypeAndBalanceMode() {
    if (this.ouNode?.children?.length) {
      this.childIsMain = this.ouNode.children.some(
        (child) => child.type === "MAIN"
      );
      this.isByLimit = this.ouNode.children.every(
        (child) => child.outputBalanceDistributionMode === "BY_LIMIT"
      );
      this.childIsByBalance = this.ouNode.children.some(
        (child) => child.outputBalanceDistributionMode === "BY_BALANCE"
      );
    }
  }

  setCorporateOuData() {
    if (this.productCategoryIds?.length) {
      this.corporateOu.allowedProductCategoryIds = this.productCategoryIds;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
