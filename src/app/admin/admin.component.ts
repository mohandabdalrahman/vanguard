import {Component} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {PagesMenuService} from "@services/pages-menu/pages-menu.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {Parent} from "../Parent";
import {AuthService} from "../auth/auth.service";
import { NbMenuService, NbSidebarService } from '@nebular/theme';

@Component({
  selector: "ngx-admin",
  styleUrls: ["../scss/common.component.scss"],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class AdminComponent extends Parent {
  constructor(
    public translate: TranslateService,
    public pageMenu: PagesMenuService,
    public currentLangService: CurrentLangService,
    public authService: AuthService,
    public menuService: NbMenuService,
    public sidebarService: NbSidebarService
  ) {
    super(
      translate,
      pageMenu,
      currentLangService,
      "admin",
      authService.getLoggedInUserRoles(),
      menuService,
      sidebarService
    );
  }
}
