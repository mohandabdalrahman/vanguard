import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {ExcelService} from "@shared/services/excel.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Lookup, MerchantSale, Sale, SaleSearchObj,} from "@models/reports.model";
import {PdfService} from "@shared/services/pdf.service";
import {ReportService} from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { addDays, fixTimeZone } from "@helpers/timezone.module";

@Component({
  selector: "app-sales-corporate",
  templateUrl: "./sales-corporate.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
})
export class SalesCorporateComponent implements OnInit, OnDestroy {
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
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  corporates: Lookup[] = [];
  corporateIds: number[] = [];
  assetType: string;
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

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.getMerchantCorporates(this.merchantId);
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
        field: `${lang === "en" ? "corporateEnName" : "corporateLocaleName"}`,
        header: "report.corporateName",
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

      {
        field: `${lang === "en" ? "siteEnName" : "siteLocaleName"}`,
        header: `${lang === "en" ? "report.siteEnName" : "report.siteLocaleName"}`,
      },
      {
        field: `${lang === "en" ? "salesPersonEnName" : "salesPersonLocaleName"}`,
        header: `${lang === "en" ? "report.salesPersonEnName" : "report.salesPersonLocaleName"}`,
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
      {field: "assetNfcSerialNumber", header: "report.assetNfcSerialNumber"},
      {field: "vehiclePlateNumber", header: "report.vehiclePlateNumber"},
      {field: "assetType", header: "report.assetType"},
      {field: "quantity", header: "report.quantity"},
    ]
  }

  setGridData(data: Sale[], isExpanded: boolean = false) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      this.gridData = formatedData.map((sale) => {
        let formated_transactionItemReportDtoList = this.reportService.addCommaToNumberValues(sale.transactionItemReportDtoList);
        // this.getAssetTypeTranslation(sale.assetType)
        return {
          transactionCreationDate: new Date(sale.transactionCreationDate).toLocaleDateString() + " "  +new Date(
            sale.transactionCreationDate
          ).toLocaleTimeString(),
          [`${this.currentLang === "en" ? "corporateEnName" : "corporateLocaleName"}`]:
            this.currentLang === "en"
              ? sale.corporateEnName
              : sale.corporateLocaleName,
          transactionItemId: sale.transactionUuid,
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
          assetNfcSerialNumber: sale.assetNfcSerialNumber,
          assetType: this.assetType,
          vehiclePlateNumber: sale.vehiclePlateNumber,
          [`${this.currentLang === "en" ? "siteEnName" : "siteLocaleName"}`]:
            this.currentLang === "en"
              ? sale.siteEnName
              : sale.siteLocaleName,
          [`${this.currentLang === "en" ? "salesPersonEnName" : "salesPersonLocaleName"}`]:
            this.currentLang === "en"
              ? sale.salesPersonEnName
              : sale.salesPersonLocaleName,
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
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getSales(
          removeNullProps(searchObj),
          this.currentPage -  1,
          this.pageSize
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
                    "Corporate_Sales",
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

  getMerchantCorporates(merchantId: number) {
    
    this.subs.add(
      this.reportService.getMerchantCorporates(merchantId).subscribe(
        (corporates: Lookup[]) => {
          if (corporates) {
            this.corporates = corporates
          } else {
            //this.toastr.warning("No corporates found");
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
      const selected = this.corporates.map((item) => item.id);
      this.submitForm.form.controls["corporates"].patchValue(selected);
    }
  }


  searchSite() {
    this.searchObj = {
      corporateIds: this.corporateIds.length ? this.corporateIds : this['corporates'].map((item) => item.id),
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

  getAssetTypeTranslation(assetType: string) {
    this.translate.get(`app.assetType.${assetType}`).subscribe((res) => {
      this.assetType = res
    });
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
