import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import {
  Lookup,
  LookupType,
  SaleSearchObj,
  SalesGroup,
  TotalSales,
  TotalsGroup,
} from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { BaseResponse } from "@models/response.model";
import { ProductCategory } from "../../product/product-category.model";
import { ProductCategoryService } from "../../product/productCategory.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";

@Component({
  selector: "app-cardholder-txn-amount",
  templateUrl: "./cardholder-txn-amount.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardholderTxnAmountComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  totalGroup: TotalsGroup[];
  merchantTotal: TotalSales;
  searchObj;
  salesGroup: SalesGroup;
  productCategoryIds: number[] = [];
  productIds: number[] = [];
  productCategories: ProductCategory[] = [];
  products: Lookup[] = [];
  isRtl: boolean;
  reportName: string;
  userType: string;
  totalElements: number;
  reportTitle: string;
  // pageSize = 10;
  // currentPage: number = 1;
  selectedOuIds: number[]=[];
  ouEnabled: boolean;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
    private productService: ProductCategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reportTitle = this.route.snapshot.data["reportName"];
    this.ouEnabled = this.authService.isOuEnabled();
    this.salesGroup = this.route.snapshot.data["salesGroup"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.getReportName(this.currentLang)
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.setGridData(this.totalGroup);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      }),
      this.reportService.getSelectedOuIds().subscribe((data)=>{
        this.selectedOuIds = data
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.selectedOuIds = this.reportService?.ouIds;

    if (this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID) {
      this.getProductCategories();
    }
    if (this.salesGroup === SalesGroup.PRODUCT_ID) {
      this.getProducts();
    }
  }

  getReportName(lang: string){
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
    ? `report.${this.reportName}En`
    : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      (this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID ||
        this.salesGroup === SalesGroup.PRODUCT_ID) && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        ... ( this.salesGroup === SalesGroup.PRODUCT_ID &&{ header: "product.productName"}),
        ... ( this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID &&{ header: "product.category.title"}),
      },
      {
        field: "totalNumberOfTransactionItems",
        header: "report.totalNumberOfTransactionItems",
      },
      { field: "totalSales", header: "report.totalSales" },
      { field: "totalProductsVat", header: "report.totalProductsVat" },
      {
        field: "totalSalesIncludingVat",
        header: "report.totalSalesIncludingVat",
      },
      {
        field: "totalNumberOfCardHolders",
        header: "report.totalNumberOfCardHolders",
      },
      {
        field: "totalNumberOfVehicles",
        header: "report.totalNumberOfVehicles",
      },
      // {field: "totalNumberOfHardware", header: "report.totalNumberOfHardware"},
      // {field: "totalNumberOfContainers", header: "report.totalNumberOfContainers"},
    ].filter(Boolean);
  }

  setGridData(data: TotalsGroup[]) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data); 
      this.gridData = formatedData.map((sale) => {
        return {
          [`${this.currentLang === "en" ? "groupByEn" : "groupByLocale"}`]:
            this.currentLang === "en" ? sale.groupByEn : sale.groupByLocale,
          totalNumberOfTransactionItems: sale.totalNumberOfTransactionItems,
          totalSales: sale.totalSales,
          totalProductsVat: sale.totalProductsVat,
          totalSalesIncludingVat: sale.totalSalesIncludingVat,
          totalNumberOfCardHolders: sale.totalNumberOfCardHolders,
          totalNumberOfVehicles: sale.totalNumberOfVehicles,
          // totalNumberOfHardware: sale.totalNumberOfHardware,
          // totalNumberOfContainers: sale.totalNumberOfContainers,
        };
      });
    } else {
      this.gridData = [];
    }
  }

  // getTotalSales(searchObj?: SaleSearchObj, pageSize?: number) {
  getTotalSales(searchObj?: SaleSearchObj) {
    // this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getTotalSales(SalesGroup[this.salesGroup], removeNullProps(searchObj),
        // this.currentPage - 1,
        // this.pageSize
        )
        .subscribe(
          (total: TotalSales) => {
            if (total?.totalsGroups?.length) {
              this.merchantTotal = total;
              this.totalElements = total?.totalsGroups?.length
              this.totalGroup = total?.totalsGroups;
              this.setGridData(this.totalGroup);
            } else {
              this.totalElements = 0;
              this.merchantTotal = null;
              this.setGridData(null);
              this.translate
                .get(["error.noExpensesFound", "type.warning"])
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
      this.productService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
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

  getProducts() {
    
    this.subs.add(
      this.reportService
        .getCorporateLookup(this.corporateId, LookupType.PRODUCT)
        .subscribe(
          (products: Lookup[]) => {
            if (products.length) {
              this.products = products;
            } else {
              this.translate.get(["error.prodcutsNotFound", "type.warning"]).subscribe(
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

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  searchCardHolderTransaction() {
    this.searchObj = {
      ...( this.userType === "admin" && {
        corporateIds:[this.corporateId]
      }),
      ...(this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID && {
        productCategoryIds: this.productCategoryIds.length
          ? this.productCategoryIds
          : null,
      }),
      ...(this.salesGroup === SalesGroup.PRODUCT_ID && {
        productIds: this.productIds.length
          ? this.productIds
          : null,
      }),
      ouIds: this.selectedOuIds,
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
    };
    // this.currentPage = 1;
    // this.getTotalSales(this.searchObj, this.pageSize);
    this.getTotalSales(this.searchObj);
  }

//   loadPage(page: number) {
//     this.currentPage = page;
//     this.getTotalSales(this.searchObj, this.pageSize);
// }

// handlePageSizeChange(pageSize: number) {
//     this.pageSize = pageSize;
//     this.currentPage = 1;
//     this.getTotalSales(this.searchObj, this.pageSize);
// }

  exportAsXLSX(): void {
    if (this.currentLang === "ar") {
      this.isRtl = true;
    }
    this.excelService.exportAsExcelFile(
      document.getElementById("printable-sale"),
      `cardHolder_expenses_per_${this.salesGroup}`,
      this.isRtl
    );
  }

  openPDF(): void {
    this.pdfService.printReport(this.colData, this.gridData ,this.reportName, this.currentLang, 
      { pdfData:[{
        dataLabel:{
          groupOneData:[
            {header:'report.totalNumberOfTransactions',field:`${this.merchantTotal.totalNumberOfTransactions}`},
          ],
          groupTwoData:[
            {header:'report.totalTransactionAmount', field:`${this.merchantTotal.totalSalesIncludingVat}`},
          ],
        },
        metaData: {
          headerTitle: 'app.total'
        }
      }] ,
      pdfComponentsWidth:{
        titleSizeTwo: 50,
        tableLabelWidth: 50,
        tableValueWidth: 50,
      }}
      )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
