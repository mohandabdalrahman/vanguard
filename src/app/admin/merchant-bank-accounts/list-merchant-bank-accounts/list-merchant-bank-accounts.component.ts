import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {Bank} from "@shared/bank-account/bank-account.model";
import {BankService} from "@shared/bank-account/bank.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {
  MerchantBankAccount,
  MerchantBankAccountGridData,
  MerchantBankAccountSearch,
} from "../merchant-bank-account.model";
import {MerchantBankAccountService} from "../merchant-bank-account.service";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-merchant-bank-accounts",
  templateUrl: "./list-merchant-bank-accounts.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-bank-accounts.component.scss",
  ],
})
export class ListMerchantBankAccountsComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantId: number;
  currentLang: string;
  merchantBankAccounts: MerchantBankAccount[] = [];
  gridData: MerchantBankAccountGridData[] = [];
  colData: ColData[] = [];
  merchantAccountId: number;
  currentPage: number = 1;
  totalElements: number;
  banks: Bank[] = [];
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private merchantBankAccountService: MerchantBankAccountService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private bankService: BankService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.merchantBankAccounts);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.merchantAccountId = id;
        this.deleteModalComponent.open();
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
        this.getMerchantBankAccounts(this.merchantId);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getBanks();
        }
      }),
    );
    this.getBanks();
  }

  setColData(lang: string) {
    this.colData = [
      {field: "id", header: "app.id"},
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en"
            ? "bankAccount.enAliasName"
            : "bankAccount.localeAliasName"
        }`,
      },
      {field: "branchAddress", header: "bankAccount.branchAddress"},
      {field: "accountNumber", header: "bankAccount.accountNumber"},
      {field: "status", header: "app.status"},
    ];
  }

  setGridData(data: MerchantBankAccount[]) {
    this.gridData = data.map((merchantBankAccount) => {
      return {
        id: merchantBankAccount.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? merchantBankAccount.enName
            : merchantBankAccount.localeName,
        branchAddress: merchantBankAccount.branchAddress,
        accountNumber: merchantBankAccount.accountNumber,
        status: !merchantBankAccount.suspended ? "active" : "inactive",
      };
    });
  }

  getMerchantBankAccounts(
    merchantId: number,
    searchObj?: MerchantBankAccountSearch
  ) {
    
    this.subs.add(
      this.merchantBankAccountService
        .getMerchantBankAccounts(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (merchantBankAccount: BaseResponse<MerchantBankAccount>) => {
            if (merchantBankAccount?.content?.length) {
              this.totalElements = merchantBankAccount.totalElements;
              this.merchantBankAccounts = merchantBankAccount.content;
              this.setGridData(this.merchantBankAccounts);
            } else {
              this.merchantBankAccounts = []
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noBankAccountFound", "type.warning"])
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

  deleteMerchantAccount() {
    
    this.subs.add(
      this.merchantBankAccountService
        .deleteMerchantBankAccount(this.merchantId, this.merchantAccountId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getMerchantBankAccounts(this.merchantId);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  //  get banks
  getBanks() {
    
    this.subs.add(
      this.bankService.getBanks().subscribe(
        (banks: BaseResponse<Bank>) => {
          if (banks.content?.length > 0) {
            this.banks = banks.content;
          } else {
            this.translate
              .get(["error.noBanksFound", "type.warning"])
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
    this.handlePagination()
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination()
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getMerchantBankAccounts(this.merchantId, this.submitForm?.value);
    }else{
      this.getMerchantBankAccounts(this.merchantId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantBankAccounts(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
