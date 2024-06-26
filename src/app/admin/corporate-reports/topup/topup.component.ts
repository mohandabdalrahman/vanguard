import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { BaseResponse } from "@models/response.model";
import { SortView } from "@models/sort-view.model";
import { TopUp, TopUpReport } from "@models/topup.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { TopUpService } from "@shared/services/topup.service";
import { CorporatesTopUpsSearch } from "app/admin/corporate-bills/corporate-bills.model";
import { Corporate } from "app/admin/corporates/corporate.model";
import { CorporateService } from "app/admin/corporates/corporate.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import {QueryParamsService} from "@shared/services/query-params.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";

@Component({
  selector: "app-topup",
  templateUrl: "./topup.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "../../../scss/common-sales-style.scss",
    './topup.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TopupComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  @ViewChild("advanceSearchForm") masterCorporateForm: NgForm;

  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  searchObj;
  topUps: TopUp[] = [];
  isRtl: boolean;
  viewType: string;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  currentPage: number = 1;
  totalElements: number;
  relatedSystemIds: string;
  corporates: Corporate[] = [];
  showAdvanceSearch: boolean;
  Two_Hours_To_MilliSeconds = 7200000;
  topUpsArr = [];
  amounts = ["<1000", "<5000", "<10000"];
  amountTo: number;
  amountFrom: number;
  reportName: string;
  userType: string;
  topUpDto: TopUpReport;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private topUpService: TopUpService,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private corporateService: CorporateService,
    private router: Router,
    private queryParamsService: QueryParamsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.reportService.sendSelectedOuIds([])
    this.router.routeReuseStrategy.shouldReuseRoute = () => { return false; };
    this.viewType = this.route.snapshot.data["view"];
    this.relatedSystemIds = sessionStorage.getItem("relatedSystemIds");
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
        if (this.viewType) {
          this.setGridData(this.topUpsArr);
        } else {
          this.setGridData(this.topUps);
        }
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    if (this.viewType) {
      this.getCorporates();
    } else {
      this.getTopUpLogs(null, this.pageSize);
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
      !!this.viewType && {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "corporates.enName" : "corporates.localeName"
        }`,
        sortable: false,
      },
      !this.viewType && {
        field: "transactionCreationDate",
        header: "report.transactionCreationDate",
      },
      {field: "amount", header: "report.amount"},
      {field: "transactionReference", header: "report.transactionReference"},
      {field: "transactionDate", header: "report.transactionDate"},
    ].filter(Boolean);
  }

  setGridData(data) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      this.gridData = formatedData.map((topUp) => {
        return {
          [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
            this.currentLang === "en"
              ? topUp.corporateEName
              : topUp.corporateLocaleName,
          transactionCreationDate: new Date(topUp.CREATION_DATE || topUp.creationDate).toLocaleString("en-EG", {timeZone: 'GMT'}),
          amount: topUp.AMOUNT || topUp.amount,
          transactionReference: topUp.TRANSACTION_REFERENCE || topUp.transactionReference,
          transactionDate: topUp.TRANSACTION_DATE?.substring(0,topUp.TRANSACTION_DATE?.indexOf("T")) || topUp.transactionDate.substring(0,topUp.transactionDate.indexOf("T")),
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getTopUpLogs(searchObj?: { fromDate: number; toDate: number }, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize
    
    this.subs.add(
      this.topUpService.getTopUpLogs(this.corporateId,
        removeNullProps(searchObj),
        this.currentPage - 1,
        this.pageSize,
        this.sortDirection,
        this.sortBy).subscribe(
        (topUps: TopUpReport) => {
          this.topUpDto = topUps
          if(pageSize){
            if (topUps.topUpPage) {
              this.topUps = topUps.topUpPage.content;
              this.totalElements = topUps.topUpPage.totalElements;
              this.setGridData(this.topUps);
            } else {
              this.topUps = null;
              this.setGridData(null);
              this.totalElements = 0;
              this.translate
                .get(["error.noTopupLogs", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
          } else {
            if (exportType == "excel") {
              if (this.currentLang === "ar") {
                this.isRtl = true;
              }
              this.setGridData(topUps.topUpList);
              setTimeout(() => {
                this.excelService.exportAsExcelFile(
                  document.getElementById("printable-sale"),
                  "Vehicle Total Expenses",
                  this.isRtl
                );
                this.setGridData(this.topUps);
                this.pageSize = 10
              }, 1000);
            } else if (exportType == "pdf") {
              this.setGridData(topUps.topUpList);
              setTimeout(() => {
                this.pdfService.printReport(
                  this.colData,
                  this.gridData ,
                  this.reportName,
                  this.currentLang,
                  { pdfData:[{
                    dataLabel:{
                      groupOneData:[
                        {header:'report.totalTransactionAmount',field:`${this.topUpDto.totalAmounts}`},
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
                this.setGridData(this.topUps);
                this.pageSize = 10
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

  searchTopup() {
    this.searchObj = {
      toDate : this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
      fromDate : this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
    };
    this.getTopUpLogs(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getTopUpLogs(this.searchObj, null, "excel")
  }

  openPDF(): void{
    this.getTopUpLogs(this.searchObj, null, "pdf")
  }

  getCorporatesTopUps(searchObj?: CorporatesTopUpsSearch) {
    this.topUpsArr = [];
    
    this.subs.add(
      this.corporateService
        .getCorporatesTopUps(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (topUps: BaseResponse<TopUp>) => {
            if (topUps.content?.length > 0) {
              this.topUps = topUps.content;
              this.totalElements = topUps.totalElements;
              this.corporates.forEach((corporate) => {
                this.topUps.forEach((topup) => {
                  if (corporate.id === topup.corporateId) {
                    this.topUpsArr.push({
                      ...topup,
                      corporateEName: corporate.enName,
                      corporateLocaleName: corporate.localeName,
                    });
                  }
                });
              });
              this.setGridData(this.topUpsArr);
            } else {
              this.topUps = [];
              this.setGridData(null);
              this.totalElements = 0;
              this.translate
                .get(["error.noTopupLogs", "type.warning"])
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

  getCorporates() {
    
    this.subs.add(
      this.corporateService.getCorporates().subscribe(
        (corporates: BaseResponse<Corporate>) => {
          if (corporates.content?.length > 0) {
            this.corporates = corporates.content;
            this.getCorporatesTopUps({
              corporateIds: this.relatedSystemIds
                ? this.relatedSystemIds?.split(",")?.map(Number)
                : null,
            });
          } else {
            this.corporates = [];
            this.translate
              .get(["error.noCorporateFound", "type.warning"])
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

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handlePagination() {
      this.handleSearch(false);
  }

  handleSearch(searchClicked: boolean) {

    searchClicked ? this.currentPage = 1 : null;

    if (this.masterCorporateForm?.value?.amount) {
      this.handleAmountValues(this.masterCorporateForm?.value?.amount);
    } else {
      this.amountFrom = null;
      this.amountTo = null;
    }
    this.getCorporatesTopUps({
      ...this.masterCorporateForm?.value,
      corporateIds: !this.masterCorporateForm?.value.corporateIds
        ? this.relatedSystemIds
        : this.masterCorporateForm?.value.corporateIds,
      transactionDateFrom: this.masterCorporateForm?.value?.transactionDateFrom
        ? fixTimeZone(Date.parse(this.masterCorporateForm?.value?.transactionDateFrom)) : null,
      transactionDateTo: this.masterCorporateForm?.value?.transactionDateTo
        ? fixTimeZone(addDays(Date.parse(this.masterCorporateForm?.value?.transactionDateTo), 1)) : null,
      amountTo: this.amountTo,
      amountFrom: this.amountFrom,
    });
  }

  handleAmountValues(amount: string) {
    const amountValue = +amount?.split("<")[1];
    switch (amountValue) {
      case 1000: {
        this.amountFrom = 0;
        this.amountTo = 999;
        break;
      }
      case 5000: {
        this.amountFrom = 999;
        this.amountTo = 4999;
        break;
      }
      case 10000: {
        this.amountFrom = 4999;
        this.amountTo = 9999;
        break;
      }
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
