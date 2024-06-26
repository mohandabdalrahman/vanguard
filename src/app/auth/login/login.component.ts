import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { Login } from "../login.model";
import { TranslateService } from "@ngx-translate/core";
import { SubSink } from "subsink";
import { CurrentLangService } from "@shared/services/current-lang.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  username: string;
  password: string;
  currentLang!: string;
  currentTheme = "default";
  showPassword: boolean = false;

  loading: boolean = false;
  @ViewChild("loginForm") loginForm;

  constructor(
    private router: Router,
    public auth: AuthService,
    public translate: TranslateService,
    private CurrentLangService:CurrentLangService
  ) {}

  ngOnInit(): void {
    if(this.CurrentLangService.getCurrentLang()!=null){
      this.currentLang=this.CurrentLangService.getCurrentLang();
    }else{
      this.currentLang='ar';
    }
    this.translate.use(this.currentLang);
    this.subs.add(
      this.auth.loading.subscribe((res) => {
        this.loading = res;
      })
    );
  }

  login(loginValue: Login) {
    this.router.navigate(["/admin"]);
    if (this.loginForm.form.status === "VALID") {
      this.auth.login(loginValue.username, loginValue.password);
    }
  }

  changeLang(lang) {
    this.currentLang = lang;
    if (lang) {
      localStorage.setItem("lang", lang);
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
