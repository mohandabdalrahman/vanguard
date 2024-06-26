import {Component, OnInit} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {CssFileService} from "./services/css-file/css-file.service";
import {NbLayoutDirectionService} from "@nebular/theme";
import {NgSelectConfig} from "@ng-select/ng-select";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs/operators";
import { CurrentLangService } from "@shared/services/current-lang.service";

@Component({
  selector: "ngx-app",
  template: `
   <app-spinner></app-spinner>
  <router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  dropdownPosition = "bottom";
  constructor(
    public translate: TranslateService,
    private cssFileService: CssFileService,
    public layoutService: NbLayoutDirectionService,
    private config: NgSelectConfig,
    private titleService: Title,
    private router: Router,
    private currentLangService:CurrentLangService
  ) {
    this.config.bindLabel = "dropdownPosition";
    this.config.bindValue = "bottom";
    translate.addLangs(["en", "fr", "ar"]);
    this.translate.reloadLang('ar')
    this.translate.reloadLang('en')
    
    const lang = this.currentLangService.getCurrentLang();
    if (lang) {
      this.cssFileService.changeDirAttribute(lang);
      translate.setDefaultLang(lang);
      translate.use(lang);
      this.cssFileService.changeCssFile(lang);
    }
  }

  ngOnInit(): void {

    this.translate.onLangChange.subscribe(({lang})=>{
      if (lang) {
        this.cssFileService.changeDirAttribute(lang)
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
        this.cssFileService.changeCssFile(lang);
      }
    })
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['pageTitle']) {
            routeTitle = route!.snapshot.data['pageTitle'];
          }
          return routeTitle;
        })
      )
      .subscribe((title: string) => {
        if (title) {
          this.titleService.setTitle(`Manex - ${title}`);
        }
      });
  }
}
