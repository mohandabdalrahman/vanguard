import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { SubSink } from "subsink";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { EmitService } from "@shared/services/emit.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import { ColData } from "@models/column-data.model";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject, forkJoin} from "rxjs";
import { MerchantService } from "app/admin/merchants/merchant.service";
import { TipTypeEnum, Tips, TipsGridData, TipsSearchCriteriaDto } from "@models/tips.model";
import { SiteService } from "@shared/sites/site.service";
import { MerchantUserService } from "@shared/merchant-users/merchant-user.service";
import { MerchantUser } from "@shared/merchant-users/merchant-user.model";

@Component({
  selector: "app-list-merchant-tips",
  templateUrl: "./list-merchant-tips.component.html",
  styleUrls: ["../../../scss/list.style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListMerchantTipsComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentPage: number = 1;
  totalElements: number;
  merchantId: number;
  gridData: TipsGridData[] = [];
  tokenId: number;
  colData: ColData[] = [
    { field: "id", header: "corporateCard.id" },
    { field: "site", header: "merchant.sites" },
    { field: "username", header: "app.username" },
    { field: "amount", header: "transaction.amount" },
    { field: "tipType", header: "merchant.tips.type" },
    //{ field: "balanceBefore", header: "merchant.tips.balanceBefore" },
    //{ field: "balanceAfter", header: "merchant.tips.balanceAfter" },
    { field: "trxUuid", header: "transaction.uuid" },
    { field: "creationDate", header: "transaction.creationDate" },
    { field: "trxReviewStatus", header: "app.status" },
  ];
  pageSize = 10;
  destroyed = new Subject<any>();
  sites: any;
  currentLang: string;
  users: MerchantUser[];

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private emitService: EmitService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private merchantUserService: MerchantUserService,
    private translate: TranslateService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.tokenId = id;
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchantTips(this.merchantId);
        }
      }),
    );
    this.getMerchantTips(this.merchantId);
    this.siteService.getMerchantSiteList(this.merchantId);
  }

  getMerchantTips(_merchantId: number, searchObj?: TipsSearchCriteriaDto) {
    
    if(searchObj == undefined){
      searchObj = new TipsSearchCriteriaDto();
    }
    searchObj.merchantId = this.merchantId
    this.subs.add(
      this.merchantService
        .getTips(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (merchantTips: BaseResponse<Tips>) => {
            if (merchantTips?.content?.length > 0) {
              this.totalElements = merchantTips.totalElements;
              this.getMerchantTipData(merchantTips.content);
              
            } else {
              this.totalElements = 0;
              this.gridData = [];
              this.translate
                .get(["error.noTipsFound", "type.warning"])
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
  getMerchantTipData(tips: Tips[]) {
    if (tips?.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.siteService.getSiteList({
            ids: [...new Set(tips.map((t) => t.siteId))],
          }),
          this.merchantUserService.getMerchantUsers(this.merchantId)
        ]).subscribe(([sitesTips, merchantUsers ]) => {
          
          this.sites = sitesTips.content;
          this.users = merchantUsers.content;
          this.setGridData(tips);
        })
      )
    } else {
      this.gridData = [];
    }
  }
  setGridData(tips: Tips[]) {
    this.gridData = tips.map((merchantTip) => {
      return {
        id: merchantTip.id,
        amount: merchantTip.amount,
        creationDate: new Date(
          merchantTip.creationDate
        ).toLocaleString(),
        //status: !merchantTip.status ? "active" : "inactive",
        tipType: $localize`merchant.tips.` + merchantTip.trxType,
        trxType: merchantTip.trxType,
        balanceBefore: merchantTip.balanceBefore,
        balanceAfter: merchantTip.balanceAfter,
        trxUuid: merchantTip?.trxType == TipTypeEnum.ADD ?  merchantTip.transactionId  : merchantTip.trxUuid,
        merchantId:merchantTip.merchantId,
        siteId:merchantTip.siteId,
        transactionId:merchantTip.transactionId,
        trxReviewStatus: merchantTip.tipStatus,
        site:
            this.currentLang === "en"
              ? this.sites.find((s) => s.id == merchantTip.siteId)?.enName
              : this.sites.find((s) => s.id == merchantTip.siteId)?.localeName,
        creatorId:merchantTip.creatorId,
        username: this.users.find((u) => u.id == merchantTip.creatorId)?.username
      };
    });
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
      this.getMerchantTips(this.merchantId, this.submitForm?.value);
    }else{
      this.getMerchantTips(this.merchantId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantTips(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
