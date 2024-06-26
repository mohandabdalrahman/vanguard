import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MerchantBankAccount} from "../merchant-bank-account.model";
import {MerchantBankAccountService} from "../merchant-bank-account.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {BankService} from "@shared/bank-account/bank.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-merchant-bank-account-details",
  templateUrl: "./merchant-bank-account-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./merchant-bank-account-details.component.scss",
  ],
})
export class MerchantBankAccountDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantBankAccount = new MerchantBankAccount();
  merchantBankAccountId: number;
  merchantId: number;
  userType: string;
  currentLang: string;
  active: boolean;

  constructor(
    private route: ActivatedRoute,
    private merchantBankAccountService: MerchantBankAccountService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private authService: AuthService,
    private bankService: BankService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.userType = this.authService.getUserType();
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

    if (this.merchantBankAccountId) {
      this.getMerchantBankAccountById();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  getMerchantBankAccountById() {
    
    this.subs.add(
      this.merchantBankAccountService
        .getMerchantBankAccountById(this.merchantId, this.merchantBankAccountId)
        .subscribe(
          (merchantBankAccount: MerchantBankAccount) => {
            if (merchantBankAccount) {
              const {
                bankId,
                suspended,
                ...other
              } =removeUnNeededProps(merchantBankAccount,["merchantId", "lastModifiedDate", "creationDate", "id"]);
                this.active = suspended;
                this.merchantBankAccount = other;
                this.getBankDetails(merchantBankAccount);
            } else {
              this.translate.get(["error.noBankAccountFound", "type.warning"]).subscribe(
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

  getBankDetails(merchantBankAccount: MerchantBankAccount) {
    
    this.subs.add(

        this.bankService.getBank(merchantBankAccount?.bankId)

      .subscribe(
        (bankName) => {
          
          this.merchantBankAccount["bankName"] = this.currentLang === "en" ? (bankName?.enName ?? "") : (bankName?.localeName??"");

        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
