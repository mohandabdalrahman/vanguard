import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {SubSink} from "subsink";
import {ColData} from "@models/column-data.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {removeNullProps} from "@helpers/check-obj";
import {Invoice, InvoiceSearch} from "@models/invoices.model";
import {Merchant} from "../../merchants/merchant.model";
import {MerchantService} from "../../merchants/merchant.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {
  InvoicesSerialNumber,
  MerchantInvoicesService,
} from "../merchant-invoices.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {
  OverwriteConfirmModalComponent
} from "@theme/components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import {NgForm} from "@angular/forms";
import * as moment from "moment";
import {AuthService} from "../../../auth/auth.service";
import {PdfService} from "@shared/services/pdf.service";
import {SortView} from "@models/sort-view.model";
import {PdfProperties} from "@models/pdfContent.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-corporate-invoices",
  templateUrl: "./list-merchant-invoices.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-invoices.component.scss",
  ],
})
export class ListMerchantInvoicesComponent implements OnInit, OnDestroy {
  @ViewChild("settleModal") private settleModalComponent: ModalComponent;
  @ViewChild("serialModal") private serialModalComponent: ModalComponent;
  @ViewChild("overwriteSerialNumber")
  private overwriteModalComponent: OverwriteConfirmModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantId: number;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  merchantInvoices: Invoice[] = [];
  merchants: Merchant[] = [];
  merchantInvoiceId: number;
  selectedInvoices: Invoice[] = [];
  currentPage: number = 1;
  totalElements: number;
  serialSuffix: string = "";
  serialPrefix: string = "";
  startSerialNumber: number = null;
  fromDate: string;
  toDate: string;
  prefix = "Prefix";
  suffix = "Suffix";
  serialNumber = "SerialNumber";
  userType: string;
  unSettledInvoices: Invoice[] = [];
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  merchantAddress: string;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private merchantInvoicesService: MerchantInvoicesService,
    private currentLangService: CurrentLangService,
    private authService: AuthService,
    private pdfService: PdfService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.serialNumberTranslation(this.currentLang);
    this.setColData();
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.serialNumberTranslation(lang);
        this.setColData();
        this.setGridData(this.merchantInvoices);
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
        this.getMerchantInvoices(this.merchantId, null);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getMerchantInvoices(this.merchantId, null);
        }
      }),
    );
  }

  serialNumberTranslation(lang: string) {
    if (lang === "ar") {
      this.prefix = "بادئة";
      this.suffix = "لاحقة";
      this.serialNumber = "رقم السري";
    } else {
      this.prefix = "Prefix";
      this.suffix = "Suffix";
      this.serialNumber = "SerialNumber";
    }
  }

  setColData() {
    this.colData = [
      {field: "id", header: "invoice.id"},
      //{field: "merchantLocaleName", header: "merchant.localeName"},
      // {field: "siteLocaleName", header: "site.name"},
      {field: "corporateLocaleName", header: "invoice.corporate.name"},
      {field: "totalValue", header: "invoice.totalValue", sortable: false},
      //{field: "merchantTaxId", header: "invoice.merchantTaxId"},
      {field: "corporateTaxId", header: "invoice.corporateTaxId"},

      {field: "fromDate", header: "invoice.fromDate"},
      {field: "toDate", header: "invoice.toDate"},
      {field: "settledAction", header: "invoice.settled"},
      // {field: "status", header: "invoice.status"},
    ];
  }

  setGridData(data: Invoice[]) {
    this.gridData = data.map((merchantInvoice) => {
      return {
        id: merchantInvoice.id,
        //merchantLocaleName: merchantInvoice.merchantLocaleName,
        // siteLocaleName: merchantInvoice.siteLocaleName,
        corporateLocaleName: merchantInvoice.corporateLocaleName,
        totalValue: merchantInvoice.totalAmount,
        merchantTaxId: merchantInvoice.merchantTaxId,
        corporateTaxId: merchantInvoice.corporateTaxId,
        settledAction: `invoice.settledAction.${merchantInvoice.settled}`,
        settled: merchantInvoice.settled,
        fromDate: moment(merchantInvoice.fromDate, "DD-MM-YYYY").format(
          "DD/MM/YY"
        ),
        toDate: moment(merchantInvoice.toDate, "DD-MM-YYYY").format("DD/MM/YY"),
        isGlobal: true,
        // status: !merchantInvoice.suspended ? "active" : "inactive",
      };
    });
  }

  getMerchantInvoices(
    merchantId: number,
    searchObj?: InvoiceSearch,
  ) {
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) : null;
    }
    this.subs.add(
      this.merchantInvoicesService
        .getMerchantInvoices(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (merchantInvoices: any) => {
            if (this.pageSize) {
              if (merchantInvoices.content?.length > 0) {
                this.totalElements = merchantInvoices.totalElements;
                this.merchantInvoices = merchantInvoices.content;
                this.setGridData(this.merchantInvoices);
              } else {
                this.totalElements = 0;
                this.merchantInvoices = [];
                this.setGridData([]);
                this.translate
                  .get(["error.noMerchantInvoicesFound", "type.warning"])
                  .subscribe((res) => {
                    this.toastr.warning(
                      Object.values(res)[0] as string,
                      Object.values(res)[1] as string
                    );
                  });
              }
              
            } else {
              
              this.print(merchantInvoices.content);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  onItemSelect(selectedItems: number[]) {
    this.selectedInvoices = this.merchantInvoices.filter((invoice) => {
      return selectedItems.includes(invoice.id);
    });
  }

  settleInvoices() {
    if (this.selectedInvoices.length) {
      const invoiceIds = this.selectedInvoices.map((invoice) => {
        return invoice.id;
      });
      
      this.subs.add(
        this.merchantInvoicesService
          .settleInvoices(this.merchantId, invoiceIds)
          .subscribe(
            () => {
              
              this.settleModalComponent.closeModal();
              this.translate.get(["success.settled"]).subscribe((res) => {
                this.toastr.success(Object.values(res)[0] as string);
              });
              this.getMerchantInvoices(this.merchantId, null);
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  setSerialNumbers(overrideExistingSerial?: boolean) {
    if (this.selectedInvoices.length) {
      const invoiceIds = this.selectedInvoices.map((invoice) => invoice.id);
      const invoicesSerialNumber: InvoicesSerialNumber = {
        invoiceIds: invoiceIds,
        startSerialNumber: this.startSerialNumber,
        serialPrefix: this.serialPrefix,
        serialSuffix: this.serialSuffix,
      };
      
      this.subs.add(
        this.merchantInvoicesService
          .setSerialNumbers(
            this.merchantId,
            invoicesSerialNumber,
            overrideExistingSerial
          )
          .subscribe(
            () => {
              
              if (overrideExistingSerial) {
                this.overwriteModalComponent.closeModal();
              } else {
                this.serialModalComponent.closeModal();
              }
              this.translate
                .get(["success.serialNumbersAdded"])
                .subscribe((res) => {
                  this.toastr.success(Object.values(res)[0] as string);
                });
            },
            (err) => {
              if (err.includes("409")) {
                
                this.serialModalComponent.closeModal();
                this.overwriteModalComponent.open();
              } else {
                this.errorService.handleErrorResponse(err);
              }
            }
          )
      );
    }
  }

  openSettleModal() {
    this.settleModalComponent.open();
  }

  resetSerialNumber() {
    this.startSerialNumber = null;
    this.serialPrefix = null;
    this.serialSuffix = null;
  }

  openSerialModal() {
    this.resetSerialNumber();
    this.serialModalComponent.open();
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
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getMerchantInvoices(
        this.merchantId,
        this.submitForm?.value,
      );
    } else {
      this.getMerchantInvoices(this.merchantId, null);
    }
  }

  getMerchant() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant) {
            this.merchantAddress = merchant.billingAddress;
          } else {
            this.translate
              .get(["error.noMerchantsFound", "type.warning"])
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

  print(unSettledInvoices: any[]) {
    this.unSettledInvoices = unSettledInvoices;

    if (this.unSettledInvoices.length) {
      let pdfProperties: PdfProperties;

      pdfProperties = {
        pdfAboutInfo: {
          lang: this.currentLang,
          fileName:
            this.currentLang == "en"
              ? "Unsetteled Invoices"
              : "فواتير غير مسددة",
        },
        pdfComponentsWidth: {
          titleSizeTwo: 50,
          tableLabelWidth: 50,
          tableValueWidth: 50,
        },
      };
      pdfProperties.pdfData = this.unSettledInvoices.map((invoice) => {
        let invoiceProductsColData: ColData[] = [];
        for (let key in invoice.invoiceProducts[0]) {
          invoiceProductsColData.push({
            field: key,
            header: `invoice.product.${key}`,
          });
        }

        return {
          metaData: {
            merchantName:
              this.currentLang == "en"
                ? invoice.merchantEnName
                : invoice.merchantLocaleName,
          },
          dataLabel: {
            pageHeaderData: [
              {header: "invoice.serialNumber", field: invoice.serialNumber},
            ],
            noBorderDivData: [
              {
                header: "app.fromDate",
                field: invoice.fromDate.substring(0, 10),
              },
              {header: "app.toDate", field: invoice.toDate.substring(0, 10)},
            ],
            groupOneData: [
              {
                header: "invoice.site.name",
                field:
                  this.currentLang === "en"
                    ? invoice.siteEnName
                    : invoice.siteLocaleName,
              },
              {header: "invoice.merchantTaxId", field: invoice.merchantTaxId},
              {
                header: "invoice.merchant.cr",
                field: invoice.merchantCommercialRegistrationNumber,
              },
              {
                header: "invoice.merchant.address",
                field: invoice.siteAddress,
              },
            ],
            groupTwoData: [
              {
                header: "invoice.corporate.name",
                field:
                  this.currentLang === "en"
                    ? invoice.corporateEnName
                    : invoice.corporateLocaleName,
              },
              {
                header: "invoice.corporateTaxId",
                field: invoice.corporateTaxId,
              },
              {
                header: "invoice.corporate.cr",
                field: invoice.corporateCommercialRegistrationNumber,
              },
            ],
            totalsData: [
              {
                header: "invoice.totalHoldingTaxAmount",
                field: `${invoice.totalHoldingTaxAmount} EGP`,
              },
              {
                header: "invoice.totalVatAmount",
                field: `${invoice.totalVatAmount} EGP`,
              },
              {
                header: "invoice.totalAmount",
                field: `${invoice.totalAmount} EGP`,
              },
            ],
          },
          dataTable: {
            colData: invoiceProductsColData,
            gridData: invoice.invoiceProducts,
          },
        };
      });
      this.pdfService.printInvoicePdf(pdfProperties, true);

      // const printableInvoices = document.getElementById("printable-invoices");
      // setTimeout(() => {
      //   this.pdfService.exportInvoiceAsPDF(
      //     printableInvoices,
      //     "unsettled-invoices"
      //   );
      // }, 1500);
      // setTimeout(() => {
      //   this.unSettledInvoices = [];
      //   
      // }, 2000);
    }
  }

  fetchAllMerchantInvoices(): void {
    this.pageSize = null;
    
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getMerchantInvoices(this.merchantId, {
        ...this.submitForm?.value,
        settled: false,
      });
    } else {
      this.getMerchantInvoices(this.merchantId, {settled: false});
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantInvoices(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
