import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {Country} from "../../../countries/country.model";
import {CountryService} from "../../../countries/country.service";
import {MeasurementUnit} from "../../measurement-unit.model";
import {MeasurementUnitService} from "../../measurement-unit.service";
import {ProductCategory, ProductGridData, ProductSearch,} from "../../product-category.model";
import {ProductCategoryService} from "../../productCategory.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-product-category",
  templateUrl: "./list-product-category.component.html",
  styleUrls: [
    "../../../../scss/list.style.scss",
    "./list-product-category.component.scss",
  ],
})
export class ListProductCategoryComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  product = new ProductCategory(false);
  countries: Country[] = [];
  units: MeasurementUnit[] = [];
  currentLang: string;
  gridData: ProductGridData[] = [];
  colData: ColData[] = [];
  productCategories: ProductCategory[] = [];
  productId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private productService: ProductCategoryService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private measurementUnitService: MeasurementUnitService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.productCategories);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.productId = id;
        this.deleteModalComponent.open();
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getCountries();
        }
      }),
    );

    this.getCountries();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "product.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "product.enName" : "product.localeName"}`,
      },
      { field: "country", header: "product.country" },
      // {field: "price", header: "product.price"},
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: ProductCategory[]) {
    this.gridData = data.map((product) => {
      return {
        id: product.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? product.enName : product.localeName,

        country:
          this.currentLang === "en"
            ? this.countries.find((country) => country.id === product.countryId)
                ?.enName ?? ""
            : this.countries.find((country) => country.id === product.countryId)
                ?.localeName ?? "",
        // price: product.price,
        status: !product.suspended ? "active" : "inactive",
      };
    });
  }

  getProducts(searchObj?: ProductSearch) {
    
    this.subs.add(
      this.productService
        .getProducts(
          { ...removeNullProps(searchObj), global: false },
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (products: BaseResponse<ProductCategory>) => {
            if (products.content?.length > 0) {
              this.totalElements = products.totalElements;
              this.productCategories = products.content;
              this.setGridData(this.productCategories);
            } else {
              this.productCategories = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries().subscribe(
        (countries: BaseResponse<Country>) => {
          if (countries.content?.length > 0) {
            this.countries = countries.content;
            this.getMeasurementUnits();
          } else {
            this.translate
              .get(["error.noCountryFound", "type.warning"])
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

  getMeasurementUnits() {
    
    this.subs.add(
      this.measurementUnitService.getMeasurementUnits().subscribe(
        (units: BaseResponse<MeasurementUnit>) => {
          if (units.content?.length > 0) {
            this.units = units.content;
            this.getProducts();
          } else {
            this.translate
              .get(["error.noMeasurmentUnitFound", "type.warning"])
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

  deleteProduct() {
    
    this.subs.add(
      this.productService.deleteProduct(this.productId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getProducts();
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination()
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination()
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getProducts(this.submitForm?.value);
    }else{
      this.getProducts();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getProducts(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
