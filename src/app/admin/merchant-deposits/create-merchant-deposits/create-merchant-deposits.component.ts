import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgForm} from "@angular/forms";
import {SubSink} from "subsink";
import {MerchantDeposit} from "../merchant-deposits.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {MerchantDepositService} from "../merchant-deposit.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import { SiteService } from '@shared/sites/site.service';
import { MerchantSite } from '@shared/sites/site.model';
import {MerchantBillingAccountService} from "../../merchant-billing-account/merchant-billing-account.service";
import { CurrentLangService } from '@shared/services/current-lang.service';

@Component({
  selector: 'app-create-merchant-deposits',
  templateUrl: './create-merchant-deposits.component.html',
  styleUrls: [
    "../../../scss/create.style.scss",
    './create-merchant-deposits.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CreateMerchantDepositsComponent implements OnInit, OnDestroy {
  @ViewChild("merchantDepositForm") submitForm: NgForm;
  private subs = new SubSink();
  merchantDeposit = new MerchantDeposit()
  userType: string;
  merchantId: number;
  billingAccount;
  sites: MerchantSite[] = [];
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private translate: TranslateService,
    private authService: AuthService,
    private merchantDepositService: MerchantDepositService,
    private siteService: SiteService,
    private MerchantBillingAccountService: MerchantBillingAccountService,
    private currentLangService: CurrentLangService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    document.title = ` Manex- ${this.route.snapshot.data["pageTitle"]}`;
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
        this.merchantDeposit.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      })
    );
    this. getBillingAccount();
  }


  createMerchantDeposit() {
    if (this.submitForm.valid) {
      
      this.merchantDeposit["depositDate"] = this.merchantDeposit["depositDate"] + " 00:00:00"
      this.subs.add(
        this.merchantDepositService
          .createMerchantDeposit(this.merchantDeposit,this.merchantDeposit.siteId)
          .subscribe(
            () => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res);
                }
              );
            },
            (err) => {
              this.merchantDeposit["depositDate"] = this.merchantDeposit["depositDate"].split(' ')[0]
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  getBillingAccount() {
    
    this.subs.add(
      this.MerchantBillingAccountService.getBillingAccount(this.merchantId).subscribe(
        (billingAccount) => {
          if (billingAccount) {
            this.billingAccount = billingAccount;
            if(this.billingAccount.depositType == 'SITE_DEPOSIT'){
              this.getSites();
            }
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getSites() {
    
    this.subs.add(
      this.siteService.getMerchantSiteList(this.merchantId, {suspended: false} , null , 200).subscribe(
        (sites) => {
          if (sites?.content?.length > 0) {
            this.sites = sites.content;
          } else {
            this.translate.get(["error.noSitesFound", "type.warning"]).subscribe(
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

  handleSuccessResponse(msg: string) {
    
    if (this.userType === 'admin') {
      this.router.navigate([
        "/admin/merchants",
        this.merchantDeposit.merchantId,
        "details",
        "deposits"
      ]);
    } else {
      this.router.navigate([
        "/merchant",
        "deposits"
      ]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
