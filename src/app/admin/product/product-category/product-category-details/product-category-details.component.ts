import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {SubSink} from "subsink";
import {CountryService} from "../../../countries/country.service";
import {ProductCategory} from "../../product-category.model";
import {ProductCategoryService} from "../../productCategory.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-product-category-details",
  templateUrl: "./product-category-details.component.html",
  styleUrls: [
    "../../../../scss/details.style.scss",
    "./product-category-details.component.scss",
  ],
})
export class ProductCategoryDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  product = {};
  productId: number;
  unitName: string;
  countryName: string;
  currentLang: string;
  suspended:boolean;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductCategoryService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.productId = params["productId"];
      })
    );
    if (this.productId) {
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
      this.productService.getProduct(this.productId).subscribe(
        (product: ProductCategory) => {
          if (product) {
            const {countryId, measurementUnitId, suspended, ...other} =
              removeUnNeededProps(product, ["id", "global", "price", "creationDate", "lastModifiedDate","globalProductTypeId", "measuringUnitId"]);
            this.product = other;
            this.suspended= !suspended;
            this.getProductData(product);
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

        this.countryService.getCountry(product?.countryId),
      ]).subscribe(
        ([country]) => {
          
          //this.product["unit"] = unit?.enName ?? "";
          this.product["country"] = this.currentLang ==="en" ?  (country?.enName ?? "") : (country?.localeName ?? "");
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
