import {Component, OnDestroy, OnInit} from '@angular/core';
import {MerchantBillingAccount} from "../merchant-billing-account.model";
import {SubSink} from "subsink";
import {ActivatedRoute} from "@angular/router";
import {MerchantBillingAccountService} from "../merchant-billing-account.service";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {BaseResponse} from "@models/response.model";
import {removeUnNeededProps} from "@helpers/remove-props";
import {MasterMerchantService} from 'app/admin/master-merchants/master-merchant.service';
import {Merchant} from "../../merchants/merchant.model";
import {MerchantService} from "../../merchants/merchant.service";
import {MasterMerchant} from "../../master-merchants/master-merchant.model";

@Component({
  selector: 'app-billing-account-details',
  templateUrl: './billing-account-details.component.html',
  styleUrls: [
    "../../../scss/details.style.scss",
    './billing-account-details.component.scss']
})
export class BillingAccountDetailsComponent implements OnInit, OnDestroy {
  billingAccount: MerchantBillingAccount;
  merchantId: number = 0;
  private subs = new SubSink();
  isAccountEmpty: boolean = false;
  userType: string;
  suspended: boolean;
  merchantDepositType: string;

  constructor(
    private route: ActivatedRoute,
    private MerchantBillingAccountService: MerchantBillingAccountService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private authService: AuthService,
    private translate: TranslateService,
    private masterMerchantService: MasterMerchantService,
    private merchantService: MerchantService,
  ) { }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
    );
    this.getBillingAccount();
    this.getMerchantById();

  }

  getMerchantById() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant.masterMerchantId) {
            this.getMasterMerchantById(merchant.masterMerchantId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }


  getMasterMerchantById(masterMerchantId: number) {
    
    this.subs.add(
      this.masterMerchantService
        .getMasterMerchantById(masterMerchantId)
        .subscribe(
          (masterMerchant: MasterMerchant) => {
            if (masterMerchant && this.billingAccount) {
              this.billingAccount.masterMerchantBalance = masterMerchant.balance;
            } else {
              this.translate.get(["error.noMasterMerchantsFound", "type.warning"]).subscribe(
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

  getBillingAccount() {
    
    this.subs.add(
      this.MerchantBillingAccountService.getBillingAccount(this.merchantId).subscribe(
        (account: BaseResponse<any>) => {
          if (account) {
            let props = [
              "merchantId",
              "id",
            ];
            const { depositType, ...other }=removeUnNeededProps(account, props);
            this.billingAccount = other;
            this.merchantDepositType = $localize`depositTypeEnum.` + depositType;
          } else {
            this.isAccountEmpty = true;
            this.translate.get(["error.noBillingAccounts", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        () => {
          this.isAccountEmpty = true;
          
        }
      )
    );
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
