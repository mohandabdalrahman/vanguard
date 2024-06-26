import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductType} from "@models/product-type.model";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {ProductTypeService} from "@shared/services/product-type.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Country} from "../../../countries/country.model";
import {CountryService} from "../../../countries/country.service";
import {MeasurementUnit} from "../../measurement-unit.model";
import {MeasurementUnitService} from "../../measurement-unit.service";
import {ProductCategory} from "../../product-category.model";
import {ProductCategoryService} from "../../productCategory.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-global-product",
  templateUrl: "./create-global-product.component.html",
  styleUrls: [
    "../../../../scss/create.style.scss",
    "./create-global-product.component.scss",
  ],
})
export class CreateGlobalProductComponent implements OnInit, OnDestroy {
  @ViewChild("productForm") submitForm: NgForm;
  private subs = new SubSink();

  isUpdateView: boolean;
  product = new ProductCategory(true);
  active = true;

  countries: Country[] = [];
  units: MeasurementUnit[] = [];

  globalProductId: number;
  productTypes: ProductType[];
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    private productCategoryService: ProductCategoryService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private countryService: CountryService,
    private productTypeService: ProductTypeService,
    private measurementUnitService: MeasurementUnitService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.globalProductId = params["globalProductId"];
      })
    );
    this.getCountries();
    this.getMeasurementUnits();
    this.getProductTypes();
    if (this.isUpdateView && this.globalProductId) {
      this.getProduct();
    }
  }

  createProduct() {
    this.product.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.productCategoryService.createProduct(this.product).subscribe(
          (product) => {
            this.translate.get("createProductSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, product.id);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  updateProduct() {
    this.product.suspended = !this.active;
    if (this.submitForm.valid && this.globalProductId) {
      
      this.subs.add(
        this.productCategoryService
          .updateProduct(this.globalProductId, this.product)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.globalProductId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries({suspended: false}).subscribe(
        (countries: BaseResponse<Country>) => {
          if (countries.content?.length > 0) {
            this.countries = countries.content;
          } else {
            this.translate.get(["error.noCountryFound", "type.warning"]).subscribe(
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

  getProductTypes() {
    
    this.subs.add(
      this.productTypeService
        .getProductTypes()
        .subscribe(
          (productTypes: BaseResponse<ProductType>) => {
            if (productTypes.content.length > 0) {
              this.productTypes = productTypes.content;
            } else {
              this.translate.get(["error.noProductTypesFound", "type.warning"]).subscribe(
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

  getMeasurementUnits() {
    
    this.subs.add(
      this.measurementUnitService
        .getMeasurementUnits({suspended: false})
        .subscribe(
          (units: BaseResponse<MeasurementUnit>) => {
            if (units.content?.length > 0) {
              this.units = units.content;
            } else {
              this.translate.get(["error.noMeasurmentUnits", "type.warning"]).subscribe(
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

  getProduct() {
    if (this.globalProductId) {
      
      this.subs.add(
        this.productCategoryService.getProduct(this.globalProductId).subscribe(
          (product: ProductCategory) => {
            if (product) {
              this.product = product;
              this.active = !this.product.suspended;
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
    } else {
      console.error("no globalProductId provided");
    }
  }

  handleSuccessResponse(msg: string, productId: number) {
    
    this.router.navigate(["/admin/global-product", productId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
