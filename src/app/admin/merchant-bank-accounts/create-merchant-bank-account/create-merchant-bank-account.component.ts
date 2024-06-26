import {Component, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {Bank} from "@shared/bank-account/bank-account.model";
import {BankService} from "@shared/bank-account/bank.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {BankSelect, MerchantBankAccount,} from "../merchant-bank-account.model";
import {MerchantBankAccountService} from "../merchant-bank-account.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {Merchant} from "../../merchants/merchant.model";
import {MerchantService} from "../../merchants/merchant.service";
import {BankAdvanceSearch} from "@models/place.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-merchant-bank-account",
  templateUrl: "./create-merchant-bank-account.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-merchant-bank-account.component.scss",
  ],
})
export class CreateMerchantBankAccountComponent implements OnInit {
  @ViewChild("createMerchantBankAccountForm") submitForm: NgForm;
  private subs = new SubSink();
  merchantBankAccount = new MerchantBankAccount();
  isUpdateView: boolean;
  isActive: boolean = false;
  merchantBankAccountId: number;
  merchantId: number;
  banks: BankSelect[] = [];
  userType: string;
  currentLang: string;

  constructor(
    private merchantBankAccountService: MerchantBankAccountService,
    private bankService: BankService,
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private authService: AuthService,
    private merchantService: MerchantService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];

    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.merchantBankAccountId = params["merchantBankAccountId"];
      })
    );

    if (this.isUpdateView) {
      this.getMerchantBankAccountById();
    }

    this.getMerchant();
  }

  getMerchantBankAccountById() {
    if (this.merchantBankAccountId) {
      
      this.subs.add(
        this.merchantBankAccountService
          .getMerchantBankAccountById(
            this.merchantId,
            this.merchantBankAccountId
          )
          .subscribe(
            (merchantBankAccount: MerchantBankAccount) => {
              
              this.merchantBankAccount = merchantBankAccount;
              this.isActive = !merchantBankAccount.suspended;
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("no merchant bank account id provided");
    }
  }

  createMerchantBankAccount() {
    this.merchantBankAccount.suspended = !this.isActive;
    this.merchantBankAccount.merchantId = this.merchantId;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.merchantBankAccountService
          .createMerchantBankAccount(this.merchantId, this.merchantBankAccount)
          .subscribe(
            (account) => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, account.id);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  updateMerchantBankAccount() {
    this.merchantBankAccount.suspended = !this.isActive;
    this.merchantBankAccount.merchantId = this.merchantId;
    if (this.submitForm.valid && this.merchantBankAccount.id) {
      
      this.subs.add(
        this.merchantBankAccountService
          .updateMerchantBankAccount(
            this.merchantId,
            this.merchantBankAccount.id,
            this.merchantBankAccount
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.merchantBankAccount.id);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  getBanks(searchObj?: BankAdvanceSearch) {
    
    searchObj.suspended = false;
    this.subs.add(
      this.bankService.getBanks(searchObj).subscribe(
        (banks: BaseResponse<Bank>) => {
          if (banks.content?.length > 0) {
            this.banks = banks.content.map((bank: Bank) => {
              return {
                id: bank.id,
                enName: bank.enName,
                localeName: bank.localeName,
              };
            });
          } else {
            this.translate.get(["error.noBanksFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMerchant() {
    if (this.merchantId) {
      
      this.subs.add(
        this.merchantService
          .getMerchant(this.merchantId)
          .subscribe(
            (merchant: Merchant) => {
              this.getBanks({countryId: merchant.countryId});
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      console.error("no merchant id provided");
    }
  }

  handleSuccessResponse(msg: string, accountId: number) {
    
    if (this.userType === 'admin') {
      this.router.navigate([
        `/admin/merchants/${this.merchantId}/details/bank-accounts`,
        accountId,
        'details'
      ]);
    } else {
      this.router.navigate([
        `/merchant/bank-accounts`,
        accountId,
        'details'
      ]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
