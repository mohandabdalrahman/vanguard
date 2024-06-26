import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {ExcelService} from "@shared/services/excel.service";

import {MerchantSite} from "@shared/sites/site.model";
import {SiteService} from "@shared/sites/site.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {ProductCategory} from "../../product/product-category.model";
import {ProductCategoryService} from "../../product/productCategory.service";
import {SaleSearchObj, SalesGroup, TotalSales, TotalsGroup,} from "@models/reports.model";
import {PdfService} from "@shared/services/pdf.service";
import {ReportService} from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { addDays, fixTimeZone } from "@helpers/timezone.module";

@Component({
  selector: "app-sales-product-category-site",
  templateUrl: "./sales-product-category-site.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SalesProductCategorySiteComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  merchantId: number;
  fromDate: string;
  toDate: string;
  totalGroup: TotalsGroup[];
  merchantTotal: TotalSales;
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  sites: MerchantSite[] = [];
  productCategories: ProductCategory[] = [];
  siteIds: number[] = [];
  productCategoryIds: number[] = [];
  isRtl: boolean;
  reportName: string;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private siteService: SiteService,
    private productService: ProductCategoryService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.merchantId = +getRelatedSystemId(null, "merchantId");
    this.getReportName(this.currentLang)
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.setGridData(this.totalGroup);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      })
    );
    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    if (this.merchantId) {
      this.getSites();
    }
    this.getProducts();
  }

  getReportName(lang: string){
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
    ? `report.${this.reportName}En`
    : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: "report.siteName",
      },
      {field: "totalNumberOfTransactionItems", header: "report.totalNumberOfTransactionItems"},
      {field: "totalSales", header: "report.totalSales"},
      {field: "totalProductsVat", header: "report.totalProductsVat"},
      {field: "totalSalesIncludingVat", header: "report.totalSalesIncludingVat"},
      {field: "totalNumberOfCardHolders", header: "report.totalNumberOfCardHolders"},
      {field: "totalNumberOfVehicles", header: "report.totalNumberOfVehicles"},
      {field: "totalNumberOfHardware", header: "report.totalNumberOfHardware"},
      {field: "totalNumberOfContainers", header: "report.totalNumberOfContainers"},
      {field: "totalNumberOfProducts", header: "report.totalNumberOfProducts"},
      {field: "totalQuantity", header: "report.totalQuantity"},
    ];
  }

  setGridData(data: TotalsGroup[]) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data); 
      this.gridData = formatedData.map((sale) => {
        return {
          [`${this.currentLang === "en" ? "groupByEn" : "groupByLocale"}`]:
            this.currentLang === "en"
              ? sale.groupByEn
              : sale.groupByLocale,
          totalNumberOfTransactionItems: sale.totalNumberOfTransactionItems,
          totalSales: sale.totalSales,
          totalProductsVat: sale.totalProductsVat,
          totalSalesIncludingVat: sale.totalSalesIncludingVat,
          totalNumberOfCardHolders: sale.totalNumberOfCardHolders,
          totalNumberOfVehicles: sale.totalNumberOfVehicles,
          totalNumberOfHardware: sale.totalNumberOfHardware,
          totalNumberOfContainers: sale.totalNumberOfContainers,
          totalNumberOfProducts: sale.totalNumberOfProducts,
          totalQuantity: sale.totalQuantity,
        }
      });
    } else {
      this.gridData = [];
    }
  }

  getMerchantSales(searchObj?: SaleSearchObj,) {
    
    this.subs.add(
      this.reportService
        .getTotalSales(
          SalesGroup.SITE_ID,
          removeNullProps(searchObj)
        )
        .subscribe(
          (total: TotalSales) => {
            if (total?.totalsGroups?.length) {
              this.merchantTotal = total;
              this.totalGroup = total?.totalsGroups;
              this.setGridData(this.totalGroup);
            } else {
              this.merchantTotal = null;
              this.setGridData(null);
              this.translate.get(["error.noSalesFound", "type.warning"]).subscribe(
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

  getSites() {
    
    this.subs.add(
      this.siteService.getMerchantSiteList(this.merchantId).subscribe(
        (sites: BaseResponse<MerchantSite>) => {
          if (sites.content?.length > 0) {
            this.sites = sites.content;
          } else {
            //this.toastr.warning("No site found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }


  getProducts() {
    
    this.subs.add(
      this.productService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
          } else {
            //this.toastr.warning("No Products found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  searchCity() {
    this.searchObj = {
      siteIds: this.siteIds.length ? this.siteIds : this['sites'].map((item) => item.id),
      productCategoryIds: this.productCategoryIds.length ? this.productCategoryIds : this['productCategories'].map((item) => item.id),
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate),1)) : null,
    };
    this.getMerchantSales(this.searchObj);
  }

  exportAsXLSX(): void {
    if (this.currentLang === 'ar') {
      this.isRtl = true;
    }
    this.excelService.exportAsExcelFile(
      document.getElementById('printable-sale'),
      "ProductCategory_Site",
      this.isRtl
    );
  }


  openPDF(): void {
    this.pdfService.printReport(this.colData, this.gridData , this.reportName, this.currentLang)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
