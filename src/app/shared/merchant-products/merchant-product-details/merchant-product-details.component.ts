import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ProductCategory} from "app/admin/product/product-category.model";
import {ProductCategoryService} from "app/admin/product/productCategory.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MerchantProduct} from "../merchant-product.model";
import {MerchantProductService} from "../merchant-product.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {ProductTypeService} from "@shared/services/product-type.service";
import {forkJoin} from "rxjs";
import {MeasurementUnitService} from "app/admin/product/measurement-unit.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-product-details",
  templateUrl: "./merchant-product-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./merchant-product-details.component.scss",
  ],
})
export class MerchantProductDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantProduct = {};
  merchantId: number;
  merchantProductId: number;
  userType: string;
  currentLang: string;
  isGlobal: boolean;
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    private merchantProductService: MerchantProductService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private productCategoryService: ProductCategoryService,
    private measurementUnitService: MeasurementUnitService,
    private productTypeService: ProductTypeService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.merchantProductId = params["merchantProductId"];
      })
    );
    if (this.merchantId && this.merchantProductId) {
      this.showMerchantProductDetails();
    }
  }

  showMerchantProductDetails(): void {
    
    this.subs.add(
      this.merchantProductService
        .getMerchantProduct(this.merchantId, this.merchantProductId)
        .subscribe(
          (merchantProduct: MerchantProduct) => {
            if (merchantProduct) {
              this.getProductData(merchantProduct);
              const { productCategoryId, suspended, ...other } =
                removeUnNeededProps(merchantProduct,["measurementUnitId","creationDate","lastModifiedDate","productTypeId", "merchantId", "id"]);
              this.merchantProduct = other;

              //this.merchantProduct['suspended'] = !merchantProduct.suspended;
              this.suspended = merchantProduct.suspended;
              this.getProductCategory(productCategoryId);
            } else {
              this.translate.get(["error.productNotFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getProductData(product: MerchantProduct) {
    
    this.subs.add(
      forkJoin([
        this.measurementUnitService.getMeasurementUnit(
          product?.measurementUnitId
        ), this.productTypeService.getProductType(product?.productTypeId)
      ]).subscribe(
        ([unit, productType]) => {
          
          this.merchantProduct["unit"] = this.currentLang === "en" ? (unit?.enName ?? ""): (unit?.localeName ?? "");
          this.merchantProduct["type"] = this.currentLang === "en" ? (productType?.enName ?? "") : (productType?.localeName ?? "");
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getProductCategory(productCategoryId: number) {
    
    this.subs.add(
      this.productCategoryService.getProduct(productCategoryId).subscribe(
        (productCategory: ProductCategory) => {
          if (productCategory) {
            this.merchantProduct["category.title"] = this.currentLang ==='en'? productCategory.enName : productCategory.localeName;
            this.subs.add(
              this.translate.onLangChange.subscribe(() => {
                this.merchantProduct["category.title"] = this.currentLang ==='en'? productCategory.enName : productCategory.localeName;
              }),
            )
            this.isGlobal = productCategory.global;
          } else {
            this.translate.get(["error.noProductCategoriesFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
