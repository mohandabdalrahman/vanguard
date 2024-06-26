import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { ColData } from "@models/column-data.model";
import { AdminInvoice, InvoiceSearch } from "@models/invoices.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import * as moment from "moment";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { AdminInvoiceService } from "../admin-invoice.service";
import { MerchantInvoicesService } from "../../merchant-invoices/merchant-invoices.service";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { AuthService } from "../../../auth/auth.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-admin-invoices",
  templateUrl: "./list-admin-invoices.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-admin-invoices.component.scss",
  ],
})
export class ListAdminInvoicesComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("settleModal") private settleModalComponent: ModalComponent;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  adminInvoices: AdminInvoice[] = [];
  currentPage: number = 1;
  totalElements: number;
  fromDate: string;
  toDate: string;
  selectedInvoices: AdminInvoice[] = [];
  pageSize = 10;
  userType: string;
  userRoles: string[];
  destroyed = new Subject<any>();

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private adminInvoiceService: AdminInvoiceService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private merchantInvoiceService: MerchantInvoicesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.userRoles = this.authService.getLoggedInUserRoles();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.adminInvoices);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getAdminInvoices();
        }
      }),
    );
    this.getAdminInvoices();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "invoice.id" },
      // {field: "merchantLocaleName", header: "invoice.merchant.name"},
      {
        field: `${lang === "en" ? "merchantEnName" : "merchantLocaleName"}`,
        header: "invoice.merchant.name",
      },
      { field: "siteLocaleName", header: "invoice.site.name" },
      {
        field: "corporateLocaleName",
        header: `${
          lang === "en" ? "corporates.enName" : "corporates.localeName"
        }`,
      },
      { field: "totalAmount", header: "invoice.totalValue" },
      { field: "settled", header: "invoice.settled" },
      { field: "fromDate", header: "invoice.fromDate" },
      { field: "toDate", header: "invoice.toDate" },
    ];
  }

  setGridData(data: AdminInvoice[]) {
    this.gridData = data.map((adminInvoice) => {
      return {
        id: adminInvoice.id,
        // merchantLocaleName: adminInvoice.merchantLocaleName,
        [`${
          this.currentLang === "en" ? "merchantEnName" : "merchantLocaleName"
        }`]:
          this.currentLang === "en"
            ? adminInvoice.merchantEnName
            : adminInvoice.merchantLocaleName,
        siteLocaleName:
          this.currentLang === "en"
            ? adminInvoice.siteEnName
            : adminInvoice.siteLocaleName,
        corporateLocaleName:
          this.currentLang === "en"
            ? adminInvoice.corporateEnName
            : adminInvoice.corporateLocaleName,
        totalAmount: adminInvoice.totalAmount,
        fromDate: moment(adminInvoice.fromDate, "DD-MM-YYYY").format(
          "DD/MM/YY"
        ),
        toDate: moment(adminInvoice.toDate, "DD-MM-YYYY").format("DD/MM/YY"),
        merchantTaxId: adminInvoice.merchantTaxId,
        corporateTaxId: adminInvoice.corporateTaxId,
        settled: adminInvoice.settled,
        isGlobal: true,
        userTypeId:
          this.userType !== "master_corporate"
            ? adminInvoice.merchantId
            : adminInvoice.corporateId,
      };
    });
  }

  getAdminInvoices(searchObj?: InvoiceSearch) {
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) : null;
    }
    this.subs.add(
      this.adminInvoiceService
        .getAdminInvoices(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (adminInvoices: BaseResponse<AdminInvoice>) => {
            if (adminInvoices.content?.length > 0) {
              this.totalElements = adminInvoices.totalElements;
              this.adminInvoices = adminInvoices.content;
              this.setGridData(this.adminInvoices);
            } else {
              this.totalElements = 0;
              this.adminInvoices = [];
              this.setGridData([]);
              this.translate
                .get(["error.noCorporateBillsFound", "type.warning"])
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

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getAdminInvoices(this.submitForm?.value);
    }else{
      this.getAdminInvoices();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getAdminInvoices(this.submitForm?.value);
  }

  onItemSelect(selectedItems: number[]) {
    this.selectedInvoices = this.adminInvoices.filter((invoice) => {
      return selectedItems.includes(invoice.id);
    });
  }

  settleInvoices() {
    if (this.selectedInvoices.length) {
      const invoiceIds = this.selectedInvoices.map((invoice) => {
        return invoice.id;
      });
      
      this.subs.add(
        this.merchantInvoiceService
          .settleInvoicesWithOutMerchantId(invoiceIds)
          .subscribe(
            () => {
              
              this.settleModalComponent.closeModal();
              this.translate.get(["success.settled"]).subscribe((res) => {
                this.toastr.success(Object.values(res)[0] as string);
              });
              this.getAdminInvoices();
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  openSettleModal() {
    this.settleModalComponent.open();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
