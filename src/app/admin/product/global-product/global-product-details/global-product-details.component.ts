import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ProductTypeService} from "@shared/services/product-type.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {SubSink} from "subsink";
import {CountryService} from "../../../countries/country.service";
import {MeasurementUnitService} from "../../measurement-unit.service";
import {ProductCategory} from "../../product-category.model";
import {ProductCategoryService} from "../../productCategory.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-global-product-details",
  templateUrl: "./global-product-details.component.html",
  styleUrls: [
    "../../../../scss/details.style.scss",
    "./global-product-details.component.scss",
  ],
})
export class GlobalProductDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  product = {};
  globalProductId: number;
  unitName: string;
  productType: string;
  countryName: string;
  currentLang: string
  status: boolean;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductCategoryService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private productTypeService: ProductTypeService,
    private measurementUnitService: MeasurementUnitService,
    private countryService: CountryService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,

  ) { }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.globalProductId = params["globalProductId"];
      })
    );
    if (this.globalProductId) {
      this.showProductDetails();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }
  showProductDetails() {
    
    this.subs.add(
      this.productService.getProduct(this.globalProductId).subscribe(
        (product: ProductCategory) => {
          if (product) {
            this.getProductData(product);
            const { countryId,  ...other } =
              removeUnNeededProps(product, ["id", "globalProductTypeId","measurementUnitId","global", "suspended", "lastModifiedDate", "creationDate", "categoryTag"]);
            this.product = other;
            //this.product["enabled"] = !product.suspended;
            this.status = !product.suspended;
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
  getProductData(product: ProductCategory) {
    
    this.subs.add(
      forkJoin([
        this.measurementUnitService.getMeasurementUnit(
          product?.measurementUnitId
        ),
        this.countryService.getCountry(product?.countryId), this.productTypeService.getProductType(product?.globalProductTypeId)
      ]).subscribe(
        ([unit, country,productType]) => {
          
          this.product["unit"] = this.currentLang === "en" ? (unit?.enName ?? "") : (unit?.localeName ?? "");
          this.product["country"] = this.currentLang === "en" ? (country?.enName ?? "") :  (country?.localeName ?? "");
          this.product["type"]= this.currentLang === "en" ? (productType?.enName) : (productType?.localeName);
          this.product["price"] = this.product["price"] + " " + country?.currency.code;
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
