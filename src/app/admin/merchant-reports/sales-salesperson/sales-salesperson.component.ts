import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {MerchantUser} from "@shared/merchant-users/merchant-user.model";
import {MerchantUserService} from "@shared/merchant-users/merchant-user.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {ExcelService} from "@shared/services/excel.service";
import {RoleTag} from "app/admin/user-roles/user-role.model";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MerchantSale, Sale, SaleSearchObj,} from "@models/reports.model";
import {PdfService} from "@shared/services/pdf.service";
import {ReportService} from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { addDays, fixTimeZone } from "@helpers/timezone.module";

@Component({
  selector: "app-sales-salesperson",
  templateUrl: "./sales-salesperson.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
})
export class SalesSalespersonComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  itemsColData: ColData[] = [];
  currentLang: string;
  merchantId: number;
  fromDate: string;
  toDate: string;
  merchantSale: Sale[];
  merchantTotal: MerchantSale;
  merchantUsers: MerchantUser[] = [];
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  merchantUserIds: number[] = [];
  isRtl: boolean;
  pageSize = 10;
  reportName: string;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private merchantUserService: MerchantUserService,
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
        this.setGridData(this.merchantSale);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      })
    );
    if (this.merchantId) {
      this.getMerchantUsers();
    }
    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
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
        field: `${lang === "en" ? "salesPersonEnName" : "salesPersonLocaleName"}`,
        header: "report.salesPersonLocaleName",
      },
      {
        field: `${lang === "en" ? "siteEnName" : "siteLocaleName"}`,
        header: `${lang === "en" ? "report.siteEnName" : "report.siteLocaleName"}`,
      },
      {field: "netAmount", header: "report.netAmount"},
      {
        field: "vatAmount",
        header: "report.vatAmount",
      },
      {
        field: "grossAmount",
        header: "report.gross",
      },
      {field: "transactionCreationDate", header: "report.transactionCreationDate"}
    ];

    this.itemsColData = [
      {
        field: `${lang === "en" ? "productCategoryEnName" : "productCategoryLocaleName"}`,
        header: `${lang === "en" ? "report.productCategoryEnName" : "report.productCategoryLocaleName"}`,
      },
      {
        field: `${lang === "en" ? "productEnName" : "productLocaleName"}`,
        header: `${lang === "en" ? "report.productEnName" : "report.productLocaleName"}`,
      },
      {field: "netAmount", header: "report.netAmount"},
      {field: "vatAmount", header: "report.vatAmount"},
      {field: "transactionItemAmount", header: "report.gross"},
    ]
  }

  setGridData(data: Sale[], isExpanded: boolean = false) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      this.gridData = formatedData.map((sale) => {
        let formated_transactionItemReportDtoList = this.reportService.addCommaToNumberValues(sale.transactionItemReportDtoList);
        return {
          transactionCreationDate: new Date(sale.transactionCreationDate).toLocaleDateString() + " "  +new Date(
            sale.transactionCreationDate
          ).toLocaleTimeString(),
          [`${this.currentLang === "en" ? "salesPersonEnName" : "salesPersonLocaleName"}`]:
            this.currentLang === "en"
              ? sale.salesPersonEnName
              : sale.salesPersonLocaleName,
          salesPersonId: sale.salesPersonId,
          [`${this.currentLang === "en" ? "siteEnName" : "siteLocaleName"}`]:
            this.currentLang === "en"
              ? sale.siteEnName
              : sale.siteLocaleName,
          [`${this.currentLang === "en" ? "productCategoryEnName" : "productCategoryLocaleName"}`]:
            this.currentLang === "en"
              ? sale.productCategoryEnName
              : sale.productCategoryLocaleName,
          [`${this.currentLang === "en" ? "productEnName" : "productLocaleName"}`]:
            this.currentLang === "en"
              ? sale.productEnName
              : sale.productLocaleName,
          quantity: sale.quantity,
          netAmount: sale.netAmount,
          vatAmount: sale.vatAmount,
          grossAmount: sale.grossAmount,
          transactionItemReportDtoList: formated_transactionItemReportDtoList,
          isExpanded
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getMerchantSales(searchObj?: SaleSearchObj, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize
    
    this.subs.add(
      this.reportService
        .getSales(
          removeNullProps(searchObj),
          this.currentPage - 1, this.pageSize
        )
        .subscribe(
          (merchantSale: MerchantSale) => {
            if (pageSize) {
              if (merchantSale?.sales?.content.length) {
                this.merchantTotal = merchantSale;
                this.totalElements = merchantSale.sales.totalElements;
                this.merchantSale = merchantSale?.sales?.content;
                this.setGridData(this.merchantSale);
              } else {
                this.merchantTotal = null;
                this.totalElements = 0;
                this.setGridData(null);
                this.translate.get(["error.noSalesFound", "type.warning"]).subscribe(
                  (res) => {
                    this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                  }
                );
              }
            } else {
              if (exportType == "excel") {
                if (this.currentLang === 'ar') {
                  this.isRtl = true;
                }
                this.setGridData(merchantSale.salesList, true);
                setTimeout(() => {
                  this.excelService.exportAsExcelFile(
                    document.getElementById('printable-sale'),
                    "Salesperson",
                    this.isRtl
                  );
                  this.setGridData(this.merchantSale, false);
                }, 1000);

              } else if (exportType == "pdf") {
                this.setGridData(merchantSale.salesList,true);
                setTimeout(() => {
                  this.pdfService.printReport(this.colData, this.gridData , this.reportName, this.currentLang)
                  this.setGridData(this.merchantSale);
                }, 1000);
              }
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getMerchantUsers() {
    
    this.subs.add(
      this.merchantUserService
        .getMerchantUsers(this.merchantId, {
          roleTag: RoleTag.salesPerson,
        })
        .subscribe(
          (merchantUsers: BaseResponse<MerchantUser>) => {
            if (merchantUsers.content?.length > 0) {
              this.merchantUsers = merchantUsers.content;
            } else {
              //this.toastr.warning("No merchant users found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  selectAll(values: string[]) {
    if (values.includes("selectAll")) {
      const selected = this.merchantUsers.map((item) => item.id);
      this.submitForm.form.controls["merchantUsers"].patchValue(selected);
    }
  }

  searchSalesperson() {
    this.searchObj = {
      salesPersonIds: this.merchantUserIds.length ? this.merchantUserIds : this['merchantUsers'].map((item) => item.id),
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate),1)) : null,
    };
    this.currentPage = 1;
    this.getMerchantSales(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getMerchantSales(this.searchObj, null, "excel");
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getMerchantSales(this.searchObj, this.pageSize);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getMerchantSales(this.searchObj, this.pageSize);
  }

  openPDF(): void {
    this.getMerchantSales(this.searchObj, null, "pdf");
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
