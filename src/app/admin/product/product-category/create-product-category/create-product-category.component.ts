import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
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
  selector: "app-create-product-category",
  templateUrl: "./create-product-category.component.html",
  styleUrls: [
    "../../../../scss/create.style.scss",
    "./create-product-category.component.scss",
  ],
})
export class CreateProductCategoryComponent implements OnInit, OnDestroy {
  @ViewChild("productForm") submitForm: NgForm;
  private subs = new SubSink();
  isUpdateView: boolean;
  product = new ProductCategory(false);
  countries: Country[] = [];
  units: MeasurementUnit[] = [];
  active = true;
  productId: number;
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductCategoryService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private countryService: CountryService,
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
        this.productId = params["productId"];
      })
    );

    this.getCountries();
    this.getMeasurementUnits();
    if (this.isUpdateView && this.productId) {
      this.getProduct();
    }
  }

  createProduct() {
    this.product.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.productService.createProduct(this.product).subscribe(
          (productCategory) => {
            this.translate.get("createProductSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, productCategory.id);
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
    if (this.submitForm.valid && this.productId) {
      
      this.subs.add(
        this.productService
          .updateProduct(this.productId, this.product)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.productId);
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

  getMeasurementUnits() {
    
    this.subs.add(
      this.measurementUnitService
        .getMeasurementUnits({suspended: false})
        .subscribe(
          (units: BaseResponse<MeasurementUnit>) => {
            if (units.content?.length > 0) {
              this.units = units.content;
            } else {
              this.translate.get(["error.noMeasurmentUnitFound", "type.warning"]).subscribe(
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
    if (this.productId) {
      
      this.subs.add(
        this.productService.getProduct(this.productId).subscribe(
          (product: ProductCategory) => {
            if (product) {
              this.product = product;
              this.active = !product.suspended;
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
      console.error("no product id provided");
    }
  }

  handleSuccessResponse(msg: string, productCategoryId: number) {
    
    this.router.navigate(["/admin/product-category", productCategoryId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
