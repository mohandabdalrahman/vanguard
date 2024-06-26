import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { SubSink } from "subsink";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import {
  MerchantDeposit,
  MerchantDepositSearch,
} from "../merchant-deposits.model";
import { MerchantDepositService } from "../merchant-deposit.service";
import { ColData } from "@models/column-data.model";
import { SortView } from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import { MerchantSite, MerchantSiteSearchObj } from "@shared/sites/site.model";
import { SiteService } from "@shared/sites/site.service";

@Component({
  selector: "app-list-merchant-deposits",
  templateUrl: "./list-merchant-deposits.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-deposits.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListMerchantDepositsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  currentLang: string;
  merchantDeposits: MerchantDeposit[] = [];
  colData: ColData[] = [];
  gridData: MerchantDeposit[] = [];
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();
  sitesIds: number[]=[];
  sites: MerchantSite[]=[];

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private merchantDepositService: MerchantDepositService,
    private router: Router,
    private queryParamsService: QueryParamsService,
    private siteService: SiteService,
  ) {}

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => { return false; };
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.merchantDeposits);
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
        this.getMerchantDeposits(this.merchantId);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchantDeposits(this.merchantId);
        }
      }),
    );

    document.title = ` Manex- ${this.route.snapshot.data["pageTitle"]}`;
  }

  setColData() {
    this.colData = [
      {
        field: `${this.currentLang === "en" ? "enName" : "localeName"}`,
        header: "bankAccount.siteName",
        sortable: false,
      },
      { field:"depositTypeEnum" , header:"merchant.depositTypeEnum",sortable:false },
      { field: "depositAmount", header: "merchant.depositAmount" },
      { field: "depositReference", header: "merchant.depositReference" },
      { field: "depositDate", header: "merchant.depositDate" },
    ];
  }

  setGridData(data: MerchantDeposit[]) {
    this.gridData = data.map((merchantDeposit) => {
      return {
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
            this.currentLang === "en"
              ? this.sites.find((s) => s.id == merchantDeposit.siteId)?.enName
              : this.sites.find((s) => s.id == merchantDeposit.siteId)?.localeName,
        depositTypeEnum: merchantDeposit.siteId ? $localize`depositTypeEnum.`+"SITE_DEPOSIT":$localize`depositTypeEnum.`+"MERCHANT_DEPOSIT",
        depositAmount: merchantDeposit.depositAmount,
        depositReference: merchantDeposit.depositReference,
        depositDate: new Date(merchantDeposit.depositDate).toLocaleString(),
      };
    });
  }

  getMerchantDeposits(merchantId: number, searchObj?: MerchantDepositSearch) {
    
    this.subs.add(
      this.merchantDepositService
        .getMerchantDeposits(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (merchantDeposits: BaseResponse<MerchantDeposit>) => {
            if (merchantDeposits.content?.length > 0) {
              this.totalElements = merchantDeposits.totalElements;
              this.merchantDeposits = merchantDeposits.content;
              this.sitesIds = merchantDeposits.content.map((merchantDeposite)=>{
                  return merchantDeposite.siteId
              })
              this.getSites({ids:this.sitesIds.filter(Boolean)})
            } else {
              this.merchantDeposits = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noDepositsFound", "type.warning"])
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

  getSites(searchObj?: MerchantSiteSearchObj) {
    
    this.subs.add(
      this.siteService
        .getMerchantSiteList(
          this.merchantId,
          removeNullProps(searchObj),
        )
        .subscribe(
          (sites: BaseResponse<MerchantSite>) => {
            if (sites.content?.length > 0) {
              this.sites = sites.content
              this.setGridData(this.merchantDeposits);
            } else {
              this.totalElements = 0;
              this.translate
                .get(["error.noSitesFound", "type.warning"])
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
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
  }




  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
