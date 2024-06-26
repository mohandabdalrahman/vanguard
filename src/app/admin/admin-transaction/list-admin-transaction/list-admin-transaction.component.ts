import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {Transaction, TransactionSearch} from "@models/transaction.model";
import {User} from "@models/user.model";
import {TranslateService} from "@ngx-translate/core";
import {CardHolderService} from "@shared/services/card-holder.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {TransactionService} from "@shared/services/transaction.service";
import {MerchantSite} from "@shared/sites/site.model";
import {SiteService} from "@shared/sites/site.service";
import {Corporate} from "app/admin/corporates/corporate.model";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {Merchant} from "app/admin/merchants/merchant.model";
import {MerchantService} from "app/admin/merchants/merchant.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin, Subject} from "rxjs";
import {SubSink} from "subsink";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {AssetType} from "@models/asset-type";
import {SortView} from "@models/sort-view.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {addDays, fixTimeZone} from "@helpers/timezone.module";

type amount = "0-500" | "500-1000" | ">1000";

@Component({
  selector: "app-list-admin-transaction",
  templateUrl: "./list-admin-transaction.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-admin-transaction.component.scss",
  ],
})
export class ListAdminTransactionComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  corporateId: number;
  currentLang: string;
  corporates: Corporate[] = [];
  corporatesTransaction: Corporate[] = [];
  merchants: Merchant[] = [];
  merchantsTransaction: Merchant[] = [];
  currentPage: number = 1;
  totalElements: number;
  merchant: Merchant;
  site: MerchantSite;
  transactions: any[] = [];
  fromDate: string;
  toDate: string;
  corporateUsers: User[] = [];
  corporateUsersTransaction: User[] = [];
  sites: MerchantSite[] = [];
  sitesTransaction: MerchantSite[] = [];
  assetTypes: AssetType[] = Object.keys(AssetType).map((key) => AssetType[key]);
  amounts: amount[] = ["0-500", "500-1000", ">1000"];
  pageSize: number = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private transactionService: TransactionService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private corporateUserService: CorporateUserService,
    private corporateService: CorporateService,
    private cardHoldersService: CardHolderService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);

    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.transactions);
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getTransactions();
        }
      }),
    );
    this.getTransactions();
    this.getCorporates();
    this.getMerchants();
  }

  setColData(lang: string) {
    this.colData = [
      {field: "trxReviewStatus", header: "transaction.reviewStatus",sortable: false},
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
        field: `${lang === "en" ? "corporate.enName" : "corporate.localeName"}`,
        header: `${
          lang === "en" ? "user.corporateName" : "user.corporateName"
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
      {field: "status", header: "transaction.status", sortable: false},
    ];
  }

  setGridData(transactions: Transaction[]) {
    if (transactions.length) {
      this.gridData = transactions.map((transaction) => {
        return {
          trxReviewStatus: transaction.reviewStatus,
          id: transaction.id,
          uuid: transaction.uuid,
          creationDate: transaction.creationDate,
          [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
            this.currentLang === "en"
              ? this.sitesTransaction.find((s) => s.id == transaction.siteId)?.enName
              : this.sitesTransaction.find((s) => s.id == transaction.siteId)?.localeName,
          [`${
            this.currentLang === "en"
              ? "cardHolder.enName"
              : "cardHolder.localeName"
          }`]:
            this.currentLang === "en"
              ? this.corporateUsersTransaction.find(
                (s) => s.id == transaction.cardHolderId
              )?.enName
              : this.corporateUsersTransaction.find(
                (s) => s.id == transaction.cardHolderId
              )?.localeName,
          [`${
            this.currentLang === "en"
              ? "corporate.enName"
              : "corporate.localeName"
          }`]:
            this.currentLang === "en"
              ? this.corporatesTransaction.find((s) => s.id == transaction.corporateId)
                ?.enName
              : this.corporatesTransaction.find((s) => s.id == transaction.corporateId)
                ?.localeName,

          [`${
            this.currentLang === "en"
              ? "merchant.enName"
              : "merchant.localeName"
          }`]:
            this.currentLang === "en"
              ? this.merchantsTransaction.find((s) => s.id == transaction.merchantId)
                ?.enName
              : this.merchantsTransaction.find((s) => s.id == transaction.merchantId)
                ?.localeName,
          amount: transaction.amount,
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
            ids: transactions.map((t) => t.siteId),
          }),
          this.corporateUserService.getCorporatesUsers({
            userIds: transactions.map((t) => t.cardHolderId),
          }),
          this.corporateService.getCorporates({
            ids: transactions.map((t) => t.corporateId),
          }),
          this.merchantService.getMerchants({
            ids: transactions.map((t) => t.merchantId),
          }),
        ]).subscribe(([sitesTransaction, corporateUsersTransaction, corporatesTransaction, merchantsTransaction]) => {
          
          this.sitesTransaction = sitesTransaction.content;
          this.corporateUsersTransaction = corporateUsersTransaction.content;
          this.corporatesTransaction = corporatesTransaction.content;
          this.merchantsTransaction = merchantsTransaction.content;
          this.setGridData(transactions);
        })
      )
    } else {
      this.gridData = [];
    }
  }

  getTransactions(searchObj?: TransactionSearch) {
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null;
      searchObj.fromDate = this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null;
      if (searchObj?.amount !== ">1000") {
        searchObj.amountFrom = searchObj?.amount?.split("-")[0];
        searchObj.amountTo = searchObj?.amount?.split("-")[1];
      } else if (searchObj?.amount === ">1000") {
        searchObj.amountFrom = searchObj?.amount?.split(">")[1];
        searchObj.amountTo = null;
      }
    }
    this.setGridData([]);
    this.transactions = [];
    this.subs.add(
      this.transactionService
        .getTransactions(
          null,
          null,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (transactions: BaseResponse<Transaction>) => {
            if (transactions.content?.length > 0) {
              this.totalElements = transactions.totalElements;
              this.transactions = transactions.content;
              this.getTransactionData(transactions.content);

            } else {
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.transactionNotFound", "type.warning"])
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
          } else {
            this.toastr.warning("No corporates found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMerchants() {
    
    this.subs.add(
      this.merchantService.getMerchants().subscribe(
        (merchants: BaseResponse<Merchant>) => {
          if (merchants.content?.length > 0) {
            this.merchants = merchants.content;
          } else {
            this.toastr.warning("No Merchants found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getSites(merchantId: number) {
    if (merchantId) {
      
      this.subs.add(
        this.siteService.getMerchantSiteList(merchantId , null , null  , 250).subscribe(
          (sites: BaseResponse<MerchantSite>) => {
            if (sites.content?.length > 0) {
              this.sites = sites.content;
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.sites = [];
    }
  }

  getCardHolders(corporateId: number) {
    if (corporateId) {
      
      this.subs.add(
        this.cardHoldersService.getCardHolders(corporateId).subscribe(
          (cardHolders: any) => {
            if (cardHolders.content.length > 0) {
              const userIds = cardHolders.content.map(
                (cardHolder) => cardHolder.corporateUserId
              );
              this.getCorporateUsers(corporateId, {userIds});
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.corporateUsers = [];
    }
  }

  getCorporateUsers(corporateId: number, searchObj?: any) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(corporateId, removeNullProps(searchObj))
        .subscribe(
          (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content;
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
    this.pageSize = +pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getTransactions(this.submitForm?.value);
    } else {
      this.getTransactions();
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
      this.getTransactions(this.submitForm?.value);
    } else {
      this.getTransactions();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
