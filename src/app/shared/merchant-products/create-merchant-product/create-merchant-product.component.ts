import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {ProductCategory} from "app/admin/product/product-category.model";
import {ProductCategoryService} from "app/admin/product/productCategory.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MerchantProduct} from "../merchant-product.model";
import {MerchantProductService} from "../merchant-product.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {Merchant} from "../../../admin/merchants/merchant.model";
import {MerchantService} from "../../../admin/merchants/merchant.service";
import {ProductTypeService} from "@shared/services/product-type.service";
import {ProductType} from "@models/product-type.model";
import {MeasurementUnit} from "app/admin/product/measurement-unit.model";
import {MeasurementUnitService} from "app/admin/product/measurement-unit.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-product",
  templateUrl: "./create-merchant-product.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-merchant-product.component.scss",
  ],
})
export class CreateMerchantProductComponent implements OnInit, OnDestroy {
  @ViewChild("merchantProductForm") submitForm: NgForm;
  private subs = new SubSink();
  isUpdateView: boolean;
  merchantProduct = new MerchantProduct();
  merchantId: number;
  merchantProductId: number;
  active = true;
  productCategories: ProductCategory[] = [];
  userType: string;
  countryId: number;
  isDisabled: boolean = false;
  productTypes: ProductType[];
  measurementUnits: MeasurementUnit[];
  currentLang: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private merchantProductService: MerchantProductService,
    private productCategoryService: ProductCategoryService,
    private authService: AuthService,
    private merchantService: MerchantService,
    private productTypeService: ProductTypeService,
    private measurementUnitService: MeasurementUnitService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
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
    this.getMerchant();
    this.getMeausrementUnits();
    if (this.isUpdateView && this.merchantProductId && this.merchantId) {
      this.getMerchantProduct();
    }
  }

  createMerchantProduct() {
    this.merchantProduct.suspended = !this.active;

    if (this.submitForm.valid && this.merchantId) {
      this.merchantProduct.merchantId = this.merchantId;
      
      if (
        this.productCategories.find(
          (p) => p.id === this.merchantProduct.productCategoryId
        ).global
      ) {
        this.subs.add(
          this.merchantProductService
            .assignMerchantGlobalProduct(
              this.merchantId,
              this.merchantProduct.productCategoryId
            )
            .subscribe(
              () => {
                this.translate
                  .get(["createProductSuccessMsg"])
                  .subscribe((res) => {
                    this.toastr.success(Object.values(res)[0] as string);
                    this.router.navigate(["/merchant", "products"]);
                  });
              },
              (err) => {
                this.errorService.handleErrorResponse(err);
              }
            )
        );
      } else {
        this.subs.add(
          this.merchantProductService
            .createMerchantProduct(this.merchantId, this.merchantProduct)
            .subscribe(
              (product) => {
                if (!product) {
                  this.router.navigate(["/merchant", "products"]);
                  this.translate
                    .get(["info.pendingRequest"])
                    .subscribe((res) => {
                      this.toastr.info(Object.values(res)[0] as string);
                    });
                } else {
                  this.translate.get("createSuccessMsg").subscribe((res) => {
                    this.handleSuccessResponse(res, product.id);
                  });
                }
              },
              (err) => {
                this.errorService.handleErrorResponse(err);
              }
            )
        );
      }
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  updateMerchantProduct() {
    this.merchantProduct.suspended = !this.active;
    if (this.submitForm.valid && this.merchantId && this.merchantProductId) {
      this.merchantProduct.merchantId = this.merchantId;
      
      this.subs.add(
        this.merchantProductService
          .updateMerchantProduct(
            this.merchantId,
            this.merchantProductId,
            this.merchantProduct
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.merchantProductId);
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

  getMerchantProduct() {
    
    this.subs.add(
      this.merchantProductService
        .getMerchantProduct(this.merchantId, this.merchantProductId)
        .subscribe(
          (merchantProduct) => {
            if (merchantProduct) {
              this.merchantProduct = merchantProduct;
              this.active = !this.merchantProduct.suspended;
              if (merchantProduct.productCategoryId) {
              }
            } else {
              this.translate
                .get(["error.productNotFound", "type.warning"])
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

  getProductCategories() {
    
    this.subs.add(
      this.productCategoryService
        .getProducts({suspended: false, countryId: this.countryId})
        .subscribe(
          (productCategories: BaseResponse<ProductCategory>) => {
            if (productCategories.content?.length > 0) {
              this.productCategories = productCategories.content;
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

  getProductTypes() {
    
    this.subs.add(
      this.productTypeService.getProductTypes().subscribe(
        (productTypes: BaseResponse<ProductType>) => {
          if (productTypes.content.length > 0) {
            this.productTypes = productTypes.content;
          } else {
            this.translate
              .get(["error.noProductTypesFound", "type.warning"])
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

  getMeausrementUnits() {
    
    this.subs.add(
      this.measurementUnitService.getMeasurementUnits().subscribe(
        (measurementUnits: BaseResponse<MeasurementUnit>) => {
          if (measurementUnits.content.length > 0) {
            this.measurementUnits = measurementUnits.content;
          } else {
            this.translate
              .get(["error.noMeasurmentUnits", "type.warning"])
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

  getMerchant() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant) {
            this.countryId = merchant.countryId;
            this.getProductCategories();
            this.getProductTypes();
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  onProductCategoryChange(productCategoryId: number) {
    const productCategory = this.productCategories.find(
      (productCategory) => productCategory.id === productCategoryId
    );
    if (productCategory?.global) {
      this.merchantProduct.id = productCategory.id;
      this.merchantProduct.localeName = productCategory.localeName;
      this.merchantProduct.enName = productCategory.enName;
      this.merchantProduct.measurementUnitId =
        productCategory.measurementUnitId;
      this.merchantProduct.productTypeId = productCategory.globalProductTypeId;
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
      this.merchantProduct.localeName = null;
      this.merchantProduct.enName = null;
      this.merchantProduct.valueAddedTaxPercent = null;
      this.merchantProduct.measurementUnitId = null;
      this.merchantProduct.productTypeId = null;
    }
  }

  handleSuccessResponse(msg: string, productId: number) {
    
    if (this.userType === "admin") {
      this.router.navigate([
        "/admin/merchants",
        this.merchantId,
        "details",
        "products",
        productId,
        "details",
      ]);
    } else {
      this.router.navigate(["/merchant", "products", productId, "details"]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
