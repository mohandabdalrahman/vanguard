import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {Transaction, TransactionSearch} from "@models/transaction.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {TransactionService} from "@shared/services/transaction.service";
import {MerchantSite} from "@shared/sites/site.model";
import {SiteService} from "@shared/sites/site.service";
import {Corporate} from "app/admin/corporates/corporate.model";
import {Merchant} from "app/admin/merchants/merchant.model";
import {MerchantService} from "app/admin/merchants/merchant.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin, Subject} from "rxjs";
import {SubSink} from "subsink";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {removeNullProps} from "@helpers/check-obj";
import {User} from "@models/user.model";
import {CardHolderService} from "@shared/services/card-holder.service";
import {SortView} from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {OuNode} from "@models/ou-node.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";

@Component({
  selector: "app-list-corporate-transaction",
  templateUrl: "./list-corporate-transaction.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-transaction.component.scss",
  ],
})
export class ListCorporateTransactionComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;

  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  corporateId: number;
  currentLang: string;
  corporates: Corporate[] = [];
  currentPage: number = 1;
  totalElements: number;
  merchant: Merchant;
  site: MerchantSite;
  corporateUsers: User[] = [];
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  sites: MerchantSite[] = [];
  merchants: Merchant[] = [];
  transactions: Transaction[] = [];
  ouIds: number | number[] = null;
  destroyed = new Subject<any>();
  showCreateBtn: boolean = false;
  fromDate: string;
  toDate: string;
  policyIds:number;
  assetIds:number;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private transactionService: TransactionService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private corporateUserService: CorporateUserService,
    private cardHoldersService: CardHolderService,
    private queryParamsService: QueryParamsService,
    private router: Router,
    public corporateOuService: CorporateOuService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);

    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
        this.policyIds = +params.policyIds || null;
        this.assetIds = +params.assetIds || null;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.transactions);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getTransactions(this.corporateId);
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
        if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        } else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details'))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouIds = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
          this.fetchTransactions();
        }
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin' && this.authService.isAdminCorporateOuEnabled()) {
          this.showCreateBtn = (Number(this.authService.getStoredSelectedOuNodeId()) && this.authService.getStoredSelectedOuNodeId() !== 0);
          this.ouIds = this.authService.getStoredSelectedOuNodeId() || ids.slice(0, OU_IDS_LENGTH);
          this.fetchTransactions();
        }
      })
    );
    if (!this.authService.isOuEnabled() && !this.authService.isAdminCorporateOuEnabled()) {
      this.fetchTransactions();
    }
  }

  fetchTransactions() {
    this.getTransactions(this.corporateId);
    this.getCardHolders(this.corporateId);
  }

  setColData(lang: string) {
    this.colData = [
      {field: "uuid", header: "transaction.uuid"},
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "invoice.site.name" : "invoice.site.name"}`,
        sortable: false,
      },
      {
        field: `${
          lang === "en" ? "cardHolder.enName" : "cardHolder.localeName"
        }`,
        header: `${
          lang === "en" ? "cardHolder.enName" : "cardHolder.localeName"
        }`,
        sortable: false,
      },
      {
        field: `${lang === "en" ? "merchant.enName" : "merchant.localeName"}`,
        header: `${
          lang === "en"
            ? "transaction.merchantName"
            : "transaction.merchantName"
        }`,
        sortable: false,
      },
      {field: "amount", header: "report.amount"},
      {field: "creationDate", header: "alert.transactionDate"},
      {field: "status", header: "transaction.status", sortable: false}
    ];
    if ((this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
      this.colData.splice(this.colData.length - 1, 0, {field: "ouName", header: "unit.ouName", sortable: false})
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }

  setGridData(transactions: Transaction[]) {
    if (transactions.length) {
      this.gridData = transactions.map((transaction) => {
        return {
          id: transaction.id,
          uuid: transaction.uuid,
          creationDate: transaction.creationDate,
          [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
            this.currentLang === "en"
              ? this.sites.find((s) => s.id == transaction.siteId)?.enName
              : this.sites.find((s) => s.id == transaction.siteId)?.localeName,
          [`${
            this.currentLang === "en"
              ? "cardHolder.enName"
              : "cardHolder.localeName"
          }`]:
            this.currentLang === "en"
              ? this.corporateUsers.find(
                (s) => s.id == transaction.cardHolderId
              )?.enName
              : this.corporateUsers.find(
                (s) => s.id == transaction.cardHolderId
              )?.localeName,
          [`${
            this.currentLang === "en"
              ? "merchant.enName"
              : "merchant.localeName"
          }`]:
            this.currentLang === "en"
              ? this.merchants.find((s) => s.id == transaction.merchantId)
                ?.enName
              : this.merchants.find((s) => s.id == transaction.merchantId)
                ?.localeName,
          amount: transaction.amount,
          ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === transaction.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === transaction.ouId)?.localName ?? "",
          status: transaction.status,
          isGlobal: true,
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getTransactionData(transactions: Transaction[]) {
    if (transactions.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.siteService.getSiteList({
            ids: [...new Set(transactions.map((t) => t.siteId))],
          }),
          this.corporateUserService.getCorporatesUsers({
            userIds: [...new Set(transactions.map((t) => t.cardHolderId))],
          }),
          this.merchantService.getMerchants({
            ids: [...new Set(transactions.map((t) => t.merchantId))],
          }),
        ]).subscribe(([sites, corporateUsers, merchants]) => {
          
          this.sites = sites.content;
          this.corporateUsers = corporateUsers.content;
          this.merchants = merchants.content;
          this.setGridData(transactions);
        })
      );
    } else {
      this.gridData = [];
    }
  }

  getTransactions(corporateId: number, searchObj?: TransactionSearch) {
    if(this.corporateOuService.getSelectedOuFromStorage()?.id != 0 && (this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId())){
      this.transactionService.sendSelectedOuId(this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId())
    } else if (this.corporateOuService.getSelectedOuFromStorage()?.id == 0){
      this.transactionService.sendSelectedOuId(null)
    } else {
      this.transactionService.sendSelectedOuId(this.corporateOuService.getSelectedOuFromStorage()?.id)
    }
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) : null;
    }
    this.gridData = [];
    this.subs.add(
      this.transactionService
        .getTransactions(
          null,
          corporateId,
          removeNullProps({
            ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
            policyIds: this.policyIds ? this.policyIds : null,
            assetIds: this.assetIds ? this.assetIds : null,
            ...searchObj,
          }),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          async (transactions: BaseResponse<Transaction>) => {
            if (transactions.content?.length > 0) {
              const ouIds = [];
              this.totalElements = transactions.totalElements;
              this.transactions = transactions.content;
              if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
                this.transactions.forEach((transaction) => {
                  if (transaction.ouId) {
                    ouIds.push(transaction.ouId);
                  }
                })
                const uniqueOuIds = [...new Set(ouIds)];
                try {
                  await this.corporateOuService?.fetchOuList(this.corporateId, {ouIds: uniqueOuIds});

                } catch (error) {
                  this.errorService.handleErrorResponse(error);
                }

              }
              this.getTransactionData(transactions.content);
            } else {
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noTransactionsFound", "type.warning"])
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

  getCardHolders(corporateId: number) {
    
    this.subs.add(
      this.cardHoldersService.getCardHolders(this.corporateId, removeNullProps({
        ouIds: this.ouIds ? this.ouIds : null,
      })).subscribe(
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
                .get(["error.noUsersFound", "type.warning"])
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
      this.getTransactions(this.corporateId, this.submitForm?.value);
    } else {
      this.getTransactions(this.corporateId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    if (this.submitForm?.value) {
      this.getTransactions(this.corporateId, this.submitForm?.value);
    } else {
      this.getTransactions(this.corporateId);
    }
  }


  selectOu(ouNode: OuNode) {
    if (ouNode?.id !== null) {
      this.submitForm?.reset();
      if (ouNode.id === 0) {
        this.showCreateBtn = false;
        this.ouIds = this.ouTabsComponent.ouNodes.filter(node => node.id !== 0).map(node => node.id).slice(0, OU_IDS_LENGTH);
      } else {
        this.showCreateBtn = true;
        this.ouIds = ouNode.id;
      }
      this.setColData(this.currentLang);
      this.getTransactions(this.corporateId)
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
