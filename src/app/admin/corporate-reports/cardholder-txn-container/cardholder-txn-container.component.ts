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
import { MerchantSale, Sale, SaleSearchObj } from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { BaseResponse } from "@models/response.model";
import { User } from "@models/user.model";
import { CorporateUserService } from "../../corporate-user/corporate-user.service";
import { CorporateContainer } from "../../corporate-container/corporate-container.model";
import { CorporateContainerService } from "../../corporate-container/corporate-container.service";
import { CardHolderService } from "@shared/services/card-holder.service";

@Component({
  selector: "app-cardholder-txn-container",
  templateUrl: "./cardholder-txn-container.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardholderTxnContainerComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  sales: Sale[];
  salesTotal: MerchantSale;
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  corporateUsers: User[] = [];
  assetIds: number[] = [];
  cardHolderIds: number[] = [];
  corporateUserId: string = "";
  corporateContainers: CorporateContainer[] = [];
  isRtl: boolean;
  pageSize = 10;

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
    private corporateContainerService: CorporateContainerService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.sales);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    if (this.corporateId) {
      this.getCardHolders(this.corporateId);
      this.getCorporateContainers(this.corporateId);
    }
  }

  setColData(lang: string) {
    this.colData = [
      {
        field: "transactionCreationDate",
        header: "report.transactionCreationDate",
      },

      { field: "assetId", header: "report.containerNumber" },
      { field: "assetNfcSerialNumber", header: "report.assetNfcSerialNumber" },
      { field: "assetSuspended", header: "report.containerStatus" },
      { field: "policyId", header: "report.policyId" },
      {
        field: `${
          lang === "en" ? "productCategoryEnName" : "productCategoryLocaleName"
        }`,
        header: `${
          lang === "en"
            ? "report.productCategoryEnName"
            : "report.productCategoryLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "productEnName" : "productLocaleName"}`,
        header: `${
          lang === "en" ? "report.productEnName" : "report.productLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "cardHolderEnName" : "cardHolderLocaleName"}`,
        header: `${
          lang === "en"
            ? "report.cardHolderEnName"
            : "report.cardHolderLocaleName"
        }`,
      },

      { field: "corporateUserId", header: "report.corporateUserId" },

      { field: "transactionItemId", header: "report.transactionItemId" },

      { field: "quantity", header: "report.quantity" },
      { field: "netAmount", header: "report.netAmount" },
      {
        field: "vatAmount",
        header: "report.vatAmount",
      },
      {
        field: "transactionItemAmount",
        header: "report.gross",
      },
    ];
  }

  setGridData(data: Sale[], isExpanded: boolean = false) {
    if (data) {
      this.gridData = data.map((sale) => {
        return {
          transactionCreationDate: new Date(
            sale.transactionCreationDate
            ).toLocaleDateString() + " "  +new Date(
              sale.transactionCreationDate
            ).toLocaleTimeString(),
          assetId: sale.assetId,
          assetNfcSerialNumber: sale.assetNfcSerialNumber,
          assetSuspended: sale.assetSuspended ? "inactive" : "active",
          policyId: sale.policyId,
          [`${
            this.currentLang === "en"
              ? "productCategoryEnName"
              : "productCategoryLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.productCategoryEnName
              : sale.productCategoryLocaleName,
          [`${
            this.currentLang === "en" ? "productEnName" : "productLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.productEnName
              : sale.productLocaleName,
          [`${
            this.currentLang === "en"
              ? "cardHolderEnName"
              : "cardHolderLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.cardHolderEnName
              : sale.cardHolderLocaleName,
          corporateUserId: sale.corporateUserId,
          transactionItemId: sale.transactionItemId,
          quantity: sale.quantity,
          netAmount: sale.netAmount,
          vatAmount: sale.vatAmount,
          transactionItemAmount: sale.transactionItemAmount,
          isExpanded,
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getSales(searchObj?: SaleSearchObj, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getSales(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (sale: MerchantSale) => {
            if (pageSize) {
              if (sale?.sales?.content.length) {
                this.salesTotal = sale;
                this.totalElements = sale.sales.totalElements;
                this.sales = sale?.sales?.content;
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
                this.setGridData(sale.salesList, true);
                setTimeout(() => {
                  this.excelService.exportAsExcelFile(
                    document.getElementById("printable-sale"),
                    "CardHolderSales",
                    this.isRtl
                  );
                  this.setGridData(this.sales, false);
                }, 1000);
              } else if (exportType == "pdf") {
                this.setGridData(sale.salesList, true);
                setTimeout(() => {
                  this.pdfService.exportAsPDF(
                    document.getElementById("printable-sale"),
                    "CardHolderSales"
                  );
                  this.setGridData(this.sales);
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

  getCardHolders(corporateId: number) {
    
    this.subs.add(
      this.cardHoldersService.getCardHolders(this.corporateId).subscribe(
        (cardHolders: any) => {
          if (cardHolders.content.length > 0) {
            const userIds = cardHolders.content.map(
              (cardHolder) => cardHolder.corporateUserId
            );
            this.getCorporateUsers(corporateId, { userIds });
          } else {
            //this.toastr.warning("No Card Holders Found");
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
              //this.toastr.warning("No corporate users found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateContainers(corporateId: number) {
    
    this.subs.add(
      this.corporateContainerService
        .getCorporateContainers(corporateId)
        .subscribe(
          (corporateContainers: BaseResponse<CorporateContainer>) => {
            if (corporateContainers.content?.length > 0) {
              this.corporateContainers = corporateContainers.content;
            } else {
              //this.toastr.warning("No corporate containers found");
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
      cardHolderIds: this.cardHolderIds,
      // assetIds: this.assetIds,
      ...(this.corporateUserId && { corporateUserIds: [this.corporateUserId] }),
      fromDate: this.fromDate ? new Date(this.fromDate).getTime() : null,
      toDate: this.toDate ? new Date(this.toDate).getTime() : null,
    };
    this.currentPage = 1;
    this.getSales(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getSales(this.searchObj, null, "excel");
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getSales(this.searchObj, this.pageSize);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getSales(this.searchObj, this.pageSize);
  }

  openPDF(): void {
    this.getSales(this.searchObj, null, "pdf");
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
