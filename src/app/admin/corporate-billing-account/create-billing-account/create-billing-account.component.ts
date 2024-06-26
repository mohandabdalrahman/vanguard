import {Component, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {NgForm} from "@angular/forms";
import {BillingAccount} from "./../billing-account.model";
import {BillingAccountService} from "./../billing-account.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-billing-account",
  templateUrl: "./create-billing-account.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-billing-account.component.scss",
  ],
})
export class CreateBillingAccountComponent implements OnInit {
  billingAccount = new BillingAccount();
  isUpdateView: boolean;
  private subs = new SubSink();
  corporateId: number = null;
  billingAccoubtId: number = null;
  accountTypes: any[] = [];
  @ViewChild("billingAccountForm") submitForm: NgForm;
  deletedProps = ["suspended", "deleted", "creatorId"];
  userType: string;
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    private billingAccountService: BillingAccountService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.corporateId = null;
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.billingAccount.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.billingAccount.id = params["billingAccountId"];
      })
    );

    if (this.isUpdateView) {
      this.getBillingAccount();
    }
    this.getAccountTypes();
  }

  getBillingAccount() {
    
    this.subs.add(
      this.billingAccountService.getBillingAccount(this.corporateId).subscribe(
        (account: any) => {
          if (account) {
            this.billingAccount = account;
          } else {
            this.translate.get(["error.noBillingAccounts", "type.warning"]).subscribe(
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

  getAccountTypes() {
    
    this.subs.add(
      this.billingAccountService.getAccountTypes().subscribe(
        (accounts: BaseResponse<any>) => {
          if (accounts.content?.length > 0) {
            this.accountTypes = accounts.content;
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

  createBillingAccount() {
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.billingAccountService
          .createBillingAccount(this.corporateId, this.billingAccount)
          .subscribe(
            () => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  updateBillingAccount() {
    this.subs.add(
      this.billingAccountService
        .updateBillingAccount(this.corporateId, removeNullProps(this.billingAccount))
        .subscribe(
          () => {
            this.translate.get("updateSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res);
              }
            );
            
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
        "/admin/corporates",
        this.corporateId,
        "details",
        "billing-account",
      ]);
    } else {
      this.router.navigate([
        "/corporate",
        "billing-account",
      ]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
