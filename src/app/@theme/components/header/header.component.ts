import {ChangeDetectionStrategy, Component, OnDestroy, OnInit,} from "@angular/core";
import { Router} from "@angular/router";
import {NbMediaBreakpointsService, NbMenuItem, NbMenuService, NbSidebarService, NbThemeService,} from "@nebular/theme";
import {TranslateService} from "@ngx-translate/core";
import {Subject} from "rxjs";
import {filter, map, takeUntil} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";
import {CssFileService} from "@services/css-file/css-file.service";
import {SubSink} from "subsink";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ClearService} from "@shared/services/clear.service";

@Component({
  selector: "ngx-header",
  styleUrls: ["./header.component.scss"],
  templateUrl: "./header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  currentLang: string;
  private subs = new SubSink();

  selectedLang;
  userPictureOnly: boolean = false;
  user: any;
  userType: string;
  langs = [
    {
      value: "en",
      name: "English",
    },

    {
      value: "ar",
      name: "العربيه",
    },
  ];

  currentTheme = "default";

  items: NbMenuItem[] = [
    {
      title: "Change Password",
      link: "/admin/change-password",
      icon: "lock-outline",
    },
    {
      title: "Logout",
      icon: "log-out-outline",
    },
  ];

  profileOption: string = "";
  profileOptions = [
    {
      name: "Profile Settings",
      value: "",
    },
    {
      name: "Change Password",
      value: "change-password",
    },
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    public translate: TranslateService,
    private cssFileService: CssFileService,
    public authService: AuthService,
    private router: Router,
    private currentLangService: CurrentLangService,
    private clearService: ClearService,
  ) {
  }

  ngOnInit() {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType().toUpperCase();
    this.selectedLang = localStorage.getItem("lang");

    //TODO: THIS NEEDS TO BE HANDLED IN A SMARTER WAY
    const changePasswordLocaleTitle: string = "تغيير كلمة السر";
    const changePasswordEnTitle: string = "Change Password";

    const logoutLocaleTitle: string = "خروج";
    const logoutEnTitle: string = "Logout";
    this.items[0].link = `/${this.userType.toLowerCase()}/change-password`;
    this.items[0].title = this.currentLang === "ar" ? changePasswordLocaleTitle : changePasswordEnTitle;
    this.items[1].title = this.currentLang === "ar" ? logoutLocaleTitle : logoutEnTitle;

    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.items[0].title = this.currentLang === "ar" ? changePasswordLocaleTitle : changePasswordEnTitle;
        this.items[1].title = this.currentLang === "ar" ? logoutLocaleTitle : logoutEnTitle;
      }),
    )
    if (this.selectedLang === null) {
      this.selectedLang = "en";
    }
    this.currentTheme = this.themeService.currentTheme;

    const {xl} = this.breakpointService.getBreakpointsMap();
    this.themeService
      .onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isLessThanXl: boolean) => (this.userPictureOnly = isLessThanXl)
      );

    this.themeService
      .onThemeChange()
      .pipe(
        map(({name}) => name),
        takeUntil(this.destroy$)
      )
      .subscribe((themeName) => (this.currentTheme = themeName));

    this.menuService
      .onItemClick()
      .pipe(
        filter(({tag}) => tag === "my-context-menu"),
        map(({item: {title}}) => title)
      )
      .subscribe((title) => {
        if (title === "Logout" || title === logoutLocaleTitle) {
          this.logout();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // changeTheme(themeName: string) {
  //   this.themeService.changeTheme(themeName);
  // }

  changeLang(lang) {
    if (lang) {
      localStorage.setItem("lang", lang);
      this.cssFileService.changeDirAttribute(lang);
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
      this.cssFileService.changeCssFile(lang);
    }
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, "menu-sidebar");
    return false;
  }

  navigateHome() {
    this.router.navigate([`/${this.userType.toLowerCase()}/home`]);
    return false;
  }

  logout() {
    this.clearService.clear();
    this.authService.logout();
  }

  // changeProfileOption(option) {
  //   if (option === 'change-password') {
  //     this.router.navigate(['/admin/change-password'])
  //
  //   }
  // }
}
