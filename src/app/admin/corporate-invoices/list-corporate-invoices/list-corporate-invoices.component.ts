import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { SubSink } from "subsink";
import { ColData } from "@models/column-data.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { CorporateInvoicesService } from "../corporate-invoices.service";
import { TranslateService } from "@ngx-translate/core";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import { Invoice, InvoiceSearch } from "@models/invoices.model";
import { Merchant } from "../../merchants/merchant.model";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { EmitService } from "@shared/services/emit.service";
import { InvoiceModalComponent } from "@theme/components/invoice-modal/invoice-modal.component";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { NgForm } from "@angular/forms";
import * as moment from "moment";
import { SortView } from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-corporate-invoices",
  templateUrl: "./list-corporate-invoices.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-invoices.component.css",
  ],
})
export class ListCorporateInvoicesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private invoiceModalComponent: InvoiceModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  corporateInvoices: Invoice[] = [];
  merchants: Merchant[] = [];
  corporateInvoiceId: number;
  currentPage: number = 1;
  totalElements: number;
  fromDate: string;
  toDate: string;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private corporateInvoicesService: CorporateInvoicesService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.corporateInvoices);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getCorporateInvoices(this.corporateId);
        }
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateInvoiceId = id;
        this.invoiceModalComponent.open();
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      })
    );
    this.getCorporateInvoices(this.corporateId);
  }

  setColData() {
    this.colData = [
      { field: "id", header: "invoice.id" },
      { field: "merchantLocaleName", header: "invoice.merchant.name" },
      { field: "siteLocaleName", header: "invoice.site.name" },
      { field: "totalAmount", header: "invoice.totalValue" , sortable:false },
      //{field: "corporateLocaleName", header: "corporate.localeName"},
      { field: "fromDate", header: "invoice.fromDate" },
      { field: "toDate", header: "invoice.toDate" },
    ];
  }

  setGridData(data: Invoice[]) {
    this.gridData = data.map((corporateInvoice) => {
      return {
        id: corporateInvoice.id,
        merchantLocaleName:
          this.currentLang === "en"
            ? corporateInvoice?.merchantEnName
            : corporateInvoice?.merchantLocaleName,
        siteLocaleName:
          this.currentLang === "en"
            ? corporateInvoice?.siteEnName
            : corporateInvoice?.siteLocaleName,
        //corporateLocaleName: corporateInvoice.corporateLocaleName,
        totalAmount: corporateInvoice.totalAmount,
        fromDate: moment(corporateInvoice.fromDate, "DD-MM-YYYY").format(
          "DD/MM/YY"
        ),
        toDate: moment(corporateInvoice.toDate, "DD-MM-YYYY").format(
          "DD/MM/YY"
        ),
        merchantTaxId: corporateInvoice.merchantTaxId,
        corporateTaxId: corporateInvoice.corporateTaxId,
        isGlobal: true,
      };
    });
  }

  getCorporateInvoices(corporateId: number, searchObj?: InvoiceSearch) {
    

    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) : null;
    }
    this.subs.add(
      this.corporateInvoicesService
        .getCorporateInvoices(
          corporateId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (corporateInvoices: BaseResponse<Invoice>) => {
            if (corporateInvoices.content?.length > 0) {
              this.totalElements = corporateInvoices.totalElements;
              this.corporateInvoices = corporateInvoices.content;
              this.setGridData(this.corporateInvoices);
            } else {
              this.totalElements = 0;
              this.corporateInvoices = [];
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
      this.getCorporateInvoices(this.corporateId, this.submitForm?.value);
    }else{
      this.getCorporateInvoices(this.corporateId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporateInvoices(this.corporateId, this.submitForm?.value);
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
