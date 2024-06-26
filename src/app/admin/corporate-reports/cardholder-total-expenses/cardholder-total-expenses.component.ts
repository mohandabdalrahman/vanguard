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
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { Sale, TransactionsReportDto, TransactionsReportsSearchObj } from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import {User} from "@models/user.model";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {CardHolderService} from "@shared/services/card-holder.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";


@Component({
    selector: "app-cardholder-total-expenses",
    templateUrl: "./cardholder-total-expenses.component.html",
    styleUrls: ["../../../scss/common-sales-style.scss"],
    encapsulation: ViewEncapsulation.Emulated,
  })

export class CardholderTotalExpensesComponent implements OnInit, OnDestroy {

    @ViewChild("reportForm") submitForm: NgForm;
    private subs = new SubSink();
    gridData: any[] = [];
    colData: ColData[] = [];
    currentLang: string;
    corporateId: number;
    fromDate: string;
    toDate: string;
    salesTotal: TransactionsReportDto;
    sales: Sale[];
    currentPage: number = 1;
    totalElements: number;
    searchObj: TransactionsReportsSearchObj;
    corporateUsers: User[] = [];
    cardHolderIds: number[]=[];
    corporateUserId: string = "";
    isRtl: boolean;
    pageSize = 10;
    reportName: string;
    userType: string;
    assetType: string;
    selectedOuIds: number[]=[];
    ouEnabled: boolean;
    isAdminCorporateOuEnabled: boolean;

    constructor(
        
        private toastr: ToastrService,
        private errorService: ErrorService,
        private currentLangService: CurrentLangService,
        private translate: TranslateService,
        private reportService: ReportService,
        private excelService: ExcelService,
        private pdfService: PdfService,
        private route: ActivatedRoute,
        private corporateUserService: CorporateUserService,
        private cardHoldersService: CardHolderService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.ouEnabled = this.authService.isOuEnabled();
        this.isAdminCorporateOuEnabled = this.authService.isAdminCorporateOuEnabled();
        this.assetType = this.route.snapshot.data["assetType"];
        this.currentLang = this.currentLangService.getCurrentLang();
        this.userType = this.authService.getUserType();
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.subs.add(
          this.route.parent.params.subscribe((params) => {
            this.corporateId = +getRelatedSystemId(params, "corporateId");
          }),
          this.translate.onLangChange.subscribe(({lang}) => {
            this.currentLang = lang;
            this.getReportName(this.currentLang)
            this.setColData(this.currentLang);
            this.setGridData(this.sales);
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
        if (this.corporateId) {
          this.getCardHolders(this.corporateId);
        }
    }

    getReportName(lang: string){
        this.reportName = this.route.snapshot.data["reportName"];
        this.reportName = lang === "en"
        ? `report.${this.reportName}En`
        : `report.${this.reportName}Ar`
    }

    getCardHolders(corporateId: number) {
        
        this.subs.add(
          this.cardHoldersService.getCardHolders(this.corporateId).subscribe(
            (cardHolders: any) => {
              if (cardHolders.content.length > 0) {
                const userIds = cardHolders.content.map(
                  (cardHolder) => cardHolder.corporateUserId
                );
                this.getCorporateUsers(corporateId, {userIds});
              } else {
                this.translate
                    .get(["error.noCardHolders", "type.warning"])
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
    
    getCorporateUsers(corporateId: number, searchObj?: any) {
        
        this.subs.add(
          this.corporateUserService
            .getCorporateUsers(corporateId, removeNullProps(searchObj))
            .subscribe(
              (corporateUsers: BaseResponse<User>) => {
                if (corporateUsers.content?.length > 0) {
                  this.corporateUsers = corporateUsers.content;
                } else {
                  this.translate
                    .get(["error.noCorporateUsers", "type.warning"])
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

    getCardHolderExpensesReport(searchObj?: TransactionsReportsSearchObj, pageSize?: number, exportType?: string){
        this.pageSize = pageSize;
        
        this.subs.add(
          this.reportService
          .getTransactionsReport(
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize
          )
          .subscribe(
            (transactions: TransactionsReportDto)=>{
              if (pageSize) {
                if (transactions?.transactionsPage?.content.length) {
                  this.salesTotal = transactions
                  this.totalElements = transactions.transactionsPage.totalElements;
                  this.sales = transactions?.transactionsPage?.content;
                  this.setGridData(this.sales);
                } else {
                  this.salesTotal = null;
                  this.totalElements = 0;
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
              } else {
                if (exportType == "excel") {
                  if (this.currentLang === "ar") {
                    this.isRtl = true;
                  }
                  this.setGridData(transactions.transactionsList);
                  setTimeout(() => {
                    this.excelService.exportAsExcelFile(
                      document.getElementById("printable-sale"),
                      `${this.currentLang == "en"? "Cardholder Total Expenses":"اجمالى المصروفات لحامل الكارت"}`,
                      this.isRtl
                    );
                    this.setGridData(this.sales);
                    this.pageSize = 10
                  }, 1000);
                } else if (exportType == "pdf") {
                  this.setGridData(transactions.transactionsList);
                  setTimeout(() => {
                    this.pdfService.printReport(
                      this.colData, 
                      this.gridData,
                      this.reportName,
                      this.currentLang,
                      { pdfData:[{
                        dataLabel:{
                          groupOneData:[
                            {header:'report.totalNumberOfTransactions',field:`${this.salesTotal.totalNumberOfTransactions}`},
                          ],
                          groupTwoData:[
                            {header:'report.totalTransactionAmount', field:`${this.salesTotal.totalAmountsIncludingVat}`},
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
                    this.setGridData(this.sales);
                    this.pageSize = 10
                  }, 1000);
                }
              }
              
    
          })
        );
    
      }
    

    setColData(lang: string) {
        this.colData = [
          {
            field: "transactionUUID",
            header: "report.transactionItemId",
          },
          (this.ouEnabled || this.isAdminCorporateOuEnabled) && {field:`${lang === "en" ? "ouEnName" : "ouLocaleName"}` , header:"report.ouName"},
          {
            field: `${lang === "en" ? "cardHolderEnName" : "cardHolderLocaleName"}`,
            header: `${
              lang === "en"
                ? "report.cardHolderEnName"
                : "report.cardHolderLocaleName"
            }`,
          },
          {
            field: "grossAmount",
            header: "report.transactionGrossAmount",
          },
          {
            field: `${lang === "en" ? "siteEnName" : "siteLocaleName"}`,
            header: `${
              lang === "en" ? "report.siteEnName" : "report.siteLocaleName"
            }`,
          },
          {
            field: `${lang === "en" ? "merchantEnName" : "merchantLocaleName"}`,
            header: `${
              lang === "en" ? "report.merchantEnName" : "report.merchantLocaleName"
            }`,
          },
          {
            field: `${lang === "en" ? "cityEnName" : "cityLocaleName"}`,
            header: "report.cityName",
          },
          {
            field: "transactionCreationDate",
            header: "report.transactionDate",
          }
        ].filter(Boolean);
    }

    setGridData(data) {
        if (data) {
          let formatedData = this.reportService.addCommaToNumberValues(data);
          this.gridData = formatedData.map((sale) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "ouEnName"
                  : "ouLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.ouEnName
                  : sale.ouLocaleName,
              transactionCreationDate: new Date(
                sale.creationDate
                ).toLocaleDateString() + " "  +new Date(
                  sale.creationDate
                ).toLocaleTimeString(),
              [`${
                this.currentLang === "en"
                  ? "cardHolderEnName"
                  : "cardHolderLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.cardHolderEnName
                  : sale.cardHolderLocaleName,
              [`${this.currentLang === "en" ? "siteEnName" : "siteLocaleName"}`]:
                this.currentLang === "en" ? sale.siteEnName : sale.siteLocaleName,
              [`${
                this.currentLang === "en" ? "merchantEnName" : "merchantLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.merchantEnName
                  : sale.merchantLocaleName,
                [`${this.currentLang === "en" ? "cityEnName" : "cityLocaleName"}`]:
                this.currentLang === "en" ? sale.cityEnName : sale.cityLocaleName,
              transactionUUID: sale.uuid,
              grossAmount: sale.grossAmountIncludingVat,
            };
          });
        } else {
          this.gridData = [];
        }
    }

    selectAll(values: string[], name: string) {
        if (values.includes("selectAll")) {
          const selected = this[name].map((item) => item.id);
          this.submitForm.form.controls[name].patchValue(selected);
        }
    }

    searchCardHolderExpenses() {
        this.searchObj = {
          ...( this.userType === "admin" && {
            corporateIds:[this.corporateId]
          }),
          assetTypes:[this.assetType],
          cardHolderIds: this.cardHolderIds.length? this.cardHolderIds : null,
          fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
          toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate),1)) : null,
          ouIds: this.selectedOuIds,
        };
        this.currentPage = 1;
        this.getCardHolderExpensesReport(this.searchObj, this.pageSize);
    }

    exportAsXLSX(): void {
        this.getCardHolderExpensesReport(this.searchObj, null, "excel");
    }
    
    loadPage(page: number) {
        this.currentPage = page;
        this.getCardHolderExpensesReport(this.searchObj, this.pageSize);
    }

    handlePageSizeChange(pageSize: number) {
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.getCardHolderExpensesReport(this.searchObj, this.pageSize);
    }

    openPDF(): void {
        this.getCardHolderExpensesReport(this.searchObj, null, "pdf");
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

}