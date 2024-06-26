import {SubSink} from "subsink";
import {Component, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "./../auth.service";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {PASSWORD_REGEX} from "@shared/constants";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["../../scss/login.scss", "./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  currentPassword: string = "";
  password: string = "";
  confirmPassword: string = "";
  @ViewChild("resetForm") resetForm;
  token: any;
  private subs = new SubSink();
  currentLang: string;
  PASSWORD_REGEX = PASSWORD_REGEX;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService
  ) {}

  ngOnInit(): void {
this.currentLang = this.currentLangService.getCurrentLang();
    this.route.queryParams
    .subscribe(params => {
      this.token = params.token;
      this.validateToken();
    }
  );

  }

  validateToken() {
    this.authService.validateToken(this.token).subscribe(
      () => {
      },
      (err) => {
        this.errorService.handleErrorResponse(err);
        this.router.navigate(["/login"]);
      }
    );
  }

  forgetPassword(resetVal) {
    if (this.resetForm.form.status === "VALID") {
      this.authService.resetPassword(this.token, resetVal.password).subscribe(
        () => {
          this.handleSuccessResponse(
            "Password has changed successfully",
            "Password Reseted successfully"
          );
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      );
    }
  }

  handleSuccessResponse(msg: string, title: string) {
    this.router.navigate(["login"]);
    this.toastr.success(msg, title);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
