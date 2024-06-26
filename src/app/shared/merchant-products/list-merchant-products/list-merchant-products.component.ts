import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";
import { ProductCategory } from "app/admin/product/product-category.model";
import { ProductCategoryService } from "app/admin/product/productCategory.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { Merchant } from "../../../admin/merchants/merchant.model";
import { MerchantService } from "../../../admin/merchants/merchant.service";
import {
  MerchantProduct,
  MerchantProductGridData,
  MerchantProductSearch,
} from "../merchant-product.model";
import { MerchantProductService } from "../merchant-product.service";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-products",
  templateUrl: "./list-merchant-products.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-products.component.scss",
  ],
})
export class ListMerchantProductsComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantId: number;
  productCategories: ProductCategory[] = [];
  currentLang: string;
  gridData: MerchantProductGridData[] = [];
  colData: any[] = [];
  merchantProducts: MerchantProduct[] = [];
  merchantProductId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();


  constructor(
    private route: ActivatedRoute,
    private merchantProductService: MerchantProductService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private productCategoryService: ProductCategoryService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private merchantService: MerchantService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.merchantProducts);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.merchantProductId = id;
        this.deleteModalComponent.open();
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchant();
        }
      }),
    );
    this.getMerchant();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "product.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "product.enName" : "product.localeName"}`,
      },
      { field: "category", header: "product.category.title" },
      {
        field: "valueAddedTaxPercent",
        header: "product.valueAddedTaxPercent",
      },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: MerchantProduct[]) {
    this.gridData = data.map((merchantProduct) => {
      return {
        id: merchantProduct.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? merchantProduct.enName
            : merchantProduct.localeName,
        category:
          this.currentLang === "en"
            ? this.productCategories.find(
                (product) => product.id === merchantProduct.productCategoryId
              )?.enName ?? ""
            : this.productCategories.find(
                (product) => product.id === merchantProduct.productCategoryId
              )?.localeName ?? "",
        isGlobal:
          this.productCategories.find(
            (product) => product.id === merchantProduct.productCategoryId
          )?.global ?? "",
        valueAddedTaxPercent: merchantProduct.valueAddedTaxPercent,
        status: !merchantProduct.suspended ? "active" : "inactive",
      };
    });
  }

  // get merchant products
  getMerchantProducts(merchantId: number, searchObj?: MerchantProductSearch) {
    
    this.subs.add(
      this.merchantProductService
        .getMerchantProducts(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (merchantProducts: BaseResponse<MerchantProduct>) => {
            if (merchantProducts.content?.length > 0) {
              this.totalElements = merchantProducts.totalElements;
              this.merchantProducts = merchantProducts.content;
              this.setGridData(this.merchantProducts);
            } else {
              this.merchantProducts = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.productsNotFound", "type.warning"])
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

  // get products categories
  getProductCategories() {
    
    this.subs.add(
      this.productCategoryService.getProducts().subscribe(
        (productCategories: BaseResponse<ProductCategory>) => {
          if (productCategories.content?.length > 0) {
            this.productCategories = productCategories.content;
            this.getMerchantProducts(this.merchantId);
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

  getMerchant() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant) {
            this.getProductCategories();
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  deleteMerchantProduct() {
    
    this.subs.add(
      this.merchantProductService
        .deleteMerchantProduct(this.merchantId, this.merchantProductId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getMerchantProducts(this.merchantId);
            
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
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getMerchantProducts(this.merchantId, this.submitForm?.value);
    }else{
      this.getMerchantProducts(this.merchantId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantProducts(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
