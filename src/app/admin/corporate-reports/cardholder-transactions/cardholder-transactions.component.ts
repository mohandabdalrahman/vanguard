import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
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
import {Sale, TransactionsReportDto, TransactionsReportsSearchObj} from "@models/reports.model";
import {PdfService} from "@shared/services/pdf.service";
import {ReportService} from "@shared/services/report.service";
import {ActivatedRoute} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {User} from "@models/user.model";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {CorporateVehicleService} from "../../corporate-vehicle/corporate-vehicle.service";
import {CorporateVehicle} from "../../corporate-vehicle/corporate-vehicle.model";
import {CardHolderService} from "@shared/services/card-holder.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";
import {AssetTag} from "@models/asset-tag";
import {AssetTagService} from "@shared/services/asset-tag.service";

@Component({
  selector: "app-cardholder-transactions",
  templateUrl: "./cardholder-transactions.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardholderTransactionsComponent implements OnInit, OnDestroy {
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
  assetId: number[] = [];
  cardHolderId: number[] = [];
  corporateIds: number[] = [];
  corporateUserId: string = "";
  corporateVehicles: CorporateVehicle[] = [];
  isRtl: boolean;
  pageSize = 10;
  reportName: string;
  reportTitle: string;
  userType: string;
  selectedOuIds: number[] = [];
  ouEnabled: boolean;
  isAdminCorporateOuEnabled: boolean;
  assetTags: AssetTag[] = [];
  assetTagIds: number[] = [];

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
    private corporateVehicleService: CorporateVehicleService,
    private authService: AuthService,
    private assetTagService: AssetTagService
  ) {
  }

  ngOnInit(): void {
    this.reportTitle = this.route.snapshot.data["reportName"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.ouEnabled = this.authService.isOuEnabled();
    this.isAdminCorporateOuEnabled = this.authService.isAdminCorporateOuEnabled();
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
      this.reportService.getSelectedOuIds().subscribe((data) => {
        this.selectedOuIds = data
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.selectedOuIds = this.reportService?.ouIds;
    if (this.corporateId) {
      this.getCardHolders(this.corporateId);
      this.getCorporateVehicles(this.corporateId);
      this.getAssetTags();
    }
  }

  getReportName(lang: string) {
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
      ? `report.${this.reportName}En`
      : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      {
        field: "transactionUUID",
        header: "report.transactionItemId",
      },
      (this.ouEnabled || this.isAdminCorporateOuEnabled) && {
        field: `${lang === "en" ? "ouEnName" : "ouLocaleName"}`,
        header: "report.ouName"
      },
      {field: "vehiclePlateNumber", header: "report.vehiclePlateNumber"},
      {
        field: `${lang === "en" ? "cardHolderEnName" : "cardHolderLocaleName"}`,
        header: `${
          lang === "en"
            ? "report.cardHolderEnName"
            : "report.cardHolderLocaleName"
        }`,
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
      {field: "netAmount", header: "report.transactionNetAmount"},
      {field: "vatAmount", header: "invoice.product.vat"},
      {field: "commissionAmount", header: "report.manexCommission"},
      {field: "grossAmountIncludingCommission", header: "report.totalTransactionAmount"},
      {
        field: "transactionCreationDate",
        header: "report.transactionDate",
      },
      {
        field: "assetTagName",
        header: "corporateVehicle.assetTag",
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
          vehiclePlateNumber: sale.vehiclePlateNumber,
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
          transactionUUID: sale.uuid,
          quantity: sale.quantity,
          netAmount: sale.netAmount,
          vatAmount: sale.vatAmount,
          commissionAmount: sale.commissionAmount,
          grossAmountIncludingCommission: sale.grossAmountIncludingCommission,
          assetTagName: this.assetTags.find(tag => (tag.id+"") === sale.assetTagId)?.enName
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getDetailedExpensesReport(searchObj?: TransactionsReportsSearchObj, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getTransactionsReport(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (transactions: TransactionsReportDto) => {
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
                    "Detailed Expenses",
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
                    {
                      pdfData: [{
                        dataLabel: {
                          groupOneData: [
                            {
                              header: 'report.totalNumberOfTransactions',
                              field: `${this.salesTotal.totalNumberOfTransactions}`
                            },
                            {header: 'report.totalTransactionNetAmount', field: `${this.salesTotal.totalNetAmounts}`},
                          ],
                          groupTwoData: [
                            {
                              header: 'report.totalTransactionGrossAmount',
                              field: `${this.salesTotal.totalAmountsIncludingVat}`
                            },
                            {header: 'report.totalManexCommision', field: `${this.salesTotal.totalCommissionAmounts}`},
                          ],
                        },
                        metaData: {
                          headerTitle: 'app.total'
                        }
                      }],
                      pdfComponentsWidth: {
                        titleSizeTwo: 50,
                        tableLabelWidth: 50,
                        tableValueWidth: 50,
                      }
                    }
                  )
                  this.setGridData(this.sales);
                  this.pageSize = 10
                }, 1000);
              }
            }
            

          })
    );

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

  getCorporateVehicles(corporateId: number) {
    
    this.subs.add(
      this.corporateVehicleService.getCorporateVehicles(corporateId).subscribe(
        (corporateVehicles: BaseResponse<CorporateVehicle>) => {
          if (corporateVehicles.content?.length > 0) {
            this.corporateVehicles = corporateVehicles.content;
          } else {
            this.translate
              .get(["error.noVehiclesFound", "type.warning"])
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

  searchDetailedExpenses() {
    this.searchObj = {
      ...(this.userType === "admin" && {
        corporateIds: [this.corporateId]
      }),
      cardHolderIds: this.cardHolderId,
      assetIds: this.assetId,
      ouIds: this.selectedOuIds,
      assetTagIds: this.assetTagIds.length ? this.assetTagIds : null,
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
    };
    this.currentPage = 1;
    this.getDetailedExpensesReport(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getDetailedExpensesReport(this.searchObj, null, "excel");
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getDetailedExpensesReport(this.searchObj, this.pageSize);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getDetailedExpensesReport(this.searchObj, this.pageSize);
  }

  openPDF(): void {
    this.getDetailedExpensesReport(this.searchObj, null, "pdf");
  }


  getAssetTags() {
    
    this.subs.add(
      this.assetTagService.getAssetTags(this.corporateId).subscribe(
        (assetTags: BaseResponse<AssetTag>) => {
          if (assetTags.content?.length > 0) {
            this.assetTags = assetTags.content;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    )
  }

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
