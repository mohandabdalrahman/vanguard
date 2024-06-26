import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
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
import {CorporateService} from "app/admin/corporates/corporate.service";
import {Merchant} from "app/admin/merchants/merchant.model";
import {ToastrService} from "ngx-toastr";
import {forkJoin, Subject} from "rxjs";
import {SubSink} from "subsink";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {removeNullProps} from "@helpers/check-obj";
import {User} from "@models/user.model";
import {SortView} from "@models/sort-view.model";
import {MerchantUserService} from "@shared/merchant-users/merchant-user.service";
import {MerchantUser} from "@shared/merchant-users/merchant-user.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";

@Component({
  selector: "app-list-merchant-transaction",
  templateUrl: "./list-merchant-transaction.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-transaction.component.scss",
  ],
})
export class ListMerchantTransactionComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  private subs = new SubSink();
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  gridData: any[] = [];
  colData: ColData[] = [];
  merchantId: number;
  currentLang: string;
  corporates: Corporate[] = [];
  merchants: Merchant[] = [];
  currentPage: number = 1;
  totalElements: number;
  merchant: Merchant;
  site: MerchantSite;
  corporateUsers: User[] = [];
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  transactions: Transaction[] = [];
  sites: MerchantSite[] = [];
  merchantUsers: MerchantUser[] = [];
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private transactionService: TransactionService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private siteService: SiteService,
    private corporateService: CorporateService,
    private merchantUserService: MerchantUserService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);

    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.transactions);
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getTransactions(this.merchantId);
        }
      }),
    );

    if (this.merchantId) {
      this.getTransactions(this.merchantId);
    }
    // } else {
    //   // ADMIN TRANSACTIONS
    //   this.getTransactions(null);
    //   this.getCorporates();
    //   this.getMerchants();
    // }

    //this.getCardHolders(this.merchantId)
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
        field: `salesPerson`,
        header: `app.salesPerson`,
        sortable: false,
      },
      {
        field: `${lang === "en" ? "corporate.enName" : "corporate.localeName"}`,
        header: `${
          lang === "en" ? "user.corporateName" : "user.corporateName"
        }`,
        sortable: false,
      },
      {field: "amount", header: "report.amount"},
      {field: "creationDate", header: "alert.transactionDate"},
      {field: "status", header: "transaction.status", sortable: false},
    ];
  }

  getTransactionData(transactions: Transaction[]) {
    if (transactions.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.siteService.getSiteList({
            ids: transactions.map((t) => t.siteId),
          }),
          this.corporateService.getCorporates({
            ids: transactions.map((t) => t.corporateId),
          }),
          this.merchantUserService.getMerchantUsers(this.merchantId),
        ]).subscribe(([sites, corporates, merchantUsers]) => {
          
          this.sites = sites.content;
          this.corporates = corporates.content;
          this.merchantUsers = merchantUsers.content;
          this.setGridData(transactions);
        })
      )
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
          salesPerson:
            this.currentLang === "en"
              ? this.merchantUsers.find(
                (s) => s.id == transaction.salesPersonId
              )?.enName
              : this.merchantUsers.find(
                (s) => s.id == transaction.salesPersonId
              )?.localeName,
          [`${
            this.currentLang === "en"
              ? "corporate.enName"
              : "corporate.localeName"
          }`]:
            this.currentLang === "en"
              ? this.corporates.find((s) => s.id == transaction.corporateId)
                ?.enName
              : this.corporates.find((s) => s.id == transaction.corporateId)
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

  getTransactions(merchantId: number, searchObj?: TransactionSearch) {
    
    this.subs.add(
      this.transactionService
        .getTransactions(
          merchantId,
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
              this.transactions = transactions.content;
              this.totalElements = transactions.totalElements;
              this.getTransactionData(this.transactions);
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

  // getCardHolders(corporateId: number) {
  //   
  //   this.subs.add(
  //     this.cardHoldersService
  //       .getCardHolders(
  //         this.merchantId,
  //       )
  //       .subscribe(
  //         (cardHolders: any) => {
  //           if (cardHolders.content.length > 0) {
  //             const userIds = cardHolders.content.map(cardHolder => cardHolder.corporateUserId)
  //             this.getCorporateUsers(corporateId, {userIds})
  //           }
  //           // else {
  //           //   this.toastr.warning("No Card Holders Found");
  //           // }
  //           
  //         },
  //         (err) => {
  //           this.errorService.handleErrorResponse(err);
  //         }
  //       )
  //   );
  // }

  // getCorporateUsers(corporateId: number, searchObj?: any) {
  //   
  //   this.subs.add(
  //     this.corporateUserService
  //       .getCorporateUsers(corporateId, removeNullProps(searchObj))
  //       .subscribe(
  //         (corporateUsers: BaseResponse<User>) => {
  //           if (corporateUsers.content?.length > 0) {
  //             this.corporateUsers = corporateUsers.content;
  //           } else {
  //             this.translate.get(["error.noUsersFound", "type.warning"]).subscribe(
  //             (res) => {
  //               this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
  //             }
  //           );
  //           }
  //           
  //         },
  //         (err) => {
  //           this.errorService.handleErrorResponse(err);
  //         }
  //       )
  //   );
  // }

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
      this.getTransactions(this.merchantId, this.submitForm?.value);
    } else {
      this.getTransactions(this.merchantId);
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
      this.getTransactions(this.merchantId, this.submitForm?.value);
    } else {
      this.getTransactions(this.merchantId);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
