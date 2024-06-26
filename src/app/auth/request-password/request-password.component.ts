import {Component, OnInit} from "@angular/core";
import { Router} from "@angular/router";
import {AuthService} from "./../auth.service";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {SubSink} from "subsink";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-request-password",
  templateUrl: "./request-password.component.html",
  styleUrls: ["../../scss/login.scss", "./request-password.component.scss"],
})
export class RequestPasswordComponent implements OnInit {
  username: string;
  private subs = new SubSink();
  currentLang: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    public translate: TranslateService,

  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
    )
  }
  requestPassword(requestVal) {
    this.authService.forgetPasswordUserName(requestVal.username).subscribe(() => {
      this.handleSuccessResponse('an email has sent to you with a link to reset your password','Success');
    }, (err) => {
      if(err.status == 202)
      {
      this.handleSuccessResponse('an email has sent to you with a link to reset your password','Success');
      }
      else {
      this.errorService.handleErrorResponse(err);
    }
    }, () =>{
      this.router.navigate(['/login']) ;
    });
  }

  handleSuccessResponse(msg: string, title: string) {
    this.router.navigate(['login']);
    this.toastr.success(msg, title);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
