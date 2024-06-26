import {AuthService} from './../../../auth/auth.service';
import {SubSink} from 'subsink';
import {Component, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {PASSWORD_REGEX} from "@shared/constants";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  currentPassword: string = "";
  newPassword: string = "";
  @ViewChild("changePasswordForm") changePasswordForm;
  token: any;
  private subs = new SubSink();
  userType: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.route.params.subscribe((params) => {
      this.token = params["token"];
    });
  }

  // will send token here
  PASSWORD_REGEX = PASSWORD_REGEX;

  changePassword(resetVal) {
    if (this.changePasswordForm.form.status === "VALID") {
      
      this.authService.changePassword(resetVal.currentPassword, resetVal.newPassword).subscribe(
        () => {
          this.translate.get(["success.passwordChanged"]).subscribe(
            (res) => {
              this.handleSuccessResponse(Object.values(res)[0] as string);
            }
          );
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      );
    }
  }


  handleSuccessResponse(msg: string) {
    
    this.router.navigate([`${this.userType}`, 'home']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
