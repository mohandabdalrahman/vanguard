import {BillingAccount} from "./../billing-account.model";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {BillingAccountService} from "./../billing-account.service";
import {removeUnNeededProps} from "@helpers/remove-props";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";

// import { CorporateBillingAccountService } from './../billing-account.service';
@Component({
  selector: "app-billing-account-details",
  templateUrl: "./billing-account-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./billing-account-details.component.scss",
  ],
})
export class BillingAccountDetailsComponent implements OnInit {
  billingAccount: any = new BillingAccount();
  corporateId: number = 0;
  private subs = new SubSink();
  account: any;
  isAccountEmpty: boolean = false;
  userType: string;
  suspended: boolean;
  accountType: string;
  ouEnable:boolean
  constructor(
    private route: ActivatedRoute, // built in to view each merchant
    private billingAccountService: BillingAccountService, //
     //loading
    private toastr: ToastrService, // notification
    private errorService: ErrorService,
    private authService: AuthService, //
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType(); // admin or merchant
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.billingAccount.corporateId = +getRelatedSystemId(params, "corporateId");// not mandtory
        this.getBillingAccount();
      }),
      this.route.params.subscribe((params) => {
        this.billingAccount.id = params["billingAccountId"];
      })
    );

  }

  getBillingAccount() {
    
    this.subs.add(
      this.billingAccountService.getBillingAccount(this.corporateId).subscribe(//return respons from backend
        (account: BaseResponse<any>) => {
          if (account) {
            let props = [
              // merchent billing account attributes
              "creationDate",
              "lastModifiedDate",
              "corporateId",
              "id",
              "accountTypeId",
              "suspended",
              "corporate"
            ];
            this.account = Object.assign({}, account);
            this.billingAccount = removeUnNeededProps(account, props); // currentbalance as key , 5000 as value
            this.suspended =this.account.suspended;//not mandatory
            this.getAccountTypeById();
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

  getAccountTypeById() {
    
    this.subs.add(
      this.billingAccountService
        .getAccountTypesById(this.account.accountTypeId)
        .subscribe(
          (account: BaseResponse<any>) => {
            if (account) {
              this.account = Object.assign({}, account);
              //this.billingAccount.accountType = this.account.enName;
              this.accountType = this.account.enName;
            } else {
              this.translate.get(["error.noBillingAccountType", "type.warning"]).subscribe(
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
}
