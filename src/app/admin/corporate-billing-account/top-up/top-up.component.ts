import {Component, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {ErrorService} from "@shared/services/error.service";
import {NgForm} from "@angular/forms";
import {Topup} from "./../billing-account.model";
import {BillingAccountService} from "./../billing-account.service";

import {formatDate} from "@helpers/format-date";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ["../../../scss/create.style.scss", './top-up.component.scss']
})
export class TopUpComponent implements OnInit {
  topup = new Topup();
  isUpdateView: boolean;
  private subs = new SubSink();
  corporateId: number = null;
  accountTypes: any[] = [];
  @ViewChild("topupForm") submitForm: NgForm;
  userType: string;

  constructor(
    private route: ActivatedRoute,
    private billingAccountService: BillingAccountService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.topup.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
    );
  }

  updateTopup() {
    if (this.submitForm.valid) {
      this.topup.transactionDate = formatDate(this.topup.transactionDate);
      
      this.subs.add(
        this.billingAccountService
          .updateTopUp(this.corporateId, this.topup)
          .subscribe(
            () => {
              this.handleSuccessResponse(
                "Corporate Billing Account has been created successfully",
                "Successfully Created"
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );

    }
  }


  handleSuccessResponse(msg: string, title: string) {
    
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
    this.toastr.success(msg, title);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
