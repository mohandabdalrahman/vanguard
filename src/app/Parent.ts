import {Directive, HostListener} from "@angular/core";
import {NbMenuService, NbSidebarService} from "@nebular/theme";
import {TranslateService} from "@ngx-translate/core";
import {
  MenuItem,
  PagesMenuService,
} from "@services/pages-menu/pages-menu.service";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Directive()
export class Parent {
  @HostListener('window:beforeunload', ['$event'])
  showMessage($event: { returnValue: string; }) {
    if (window.location.pathname.includes('create')) {
      $event.returnValue = 'Your data will be lost!';
    }
  }
  menu: MenuItem[] = [];

  constructor(
    public translate: TranslateService,
    public pageMenu: PagesMenuService,
    public currentLangService: CurrentLangService,
    public userType: string,
    public roles: string[],
    public menuService: NbMenuService,
    public sidebarService: NbSidebarService
  ) {
    const lang = this.currentLangService.getCurrentLang();
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.menu = this.pageMenu.loadMenuItems(this.userType, this.roles);
    translate.onLangChange.subscribe(() => {
      this.translateMenuItems();
    });
    // console.log("menu", this.menu)
    this.translateMenuItems();
    this.menuService
      .onItemSelect()
      .subscribe(() => {
        // this.sidebarService.toggle(true, "menu-sidebar");
        if (window.innerWidth < 1200 && window.innerWidth >= 576) {
          this.sidebarService.compact("menu-sidebar");
        } else if (window.innerWidth < 576) {
          this.sidebarService.collapse("menu-sidebar");
        }
      });
  }

  translateMenuItems() {
    this.menu.forEach((item) => this.translateMenuItem(item));
  }

  translateMenuItem(menuItem: MenuItem) {
    if (menuItem.children != null) {
      menuItem.children.forEach((item) => this.translateMenuItem(item));
    }
    menuItem.title = this.translate.instant(menuItem.key);
  }
}
