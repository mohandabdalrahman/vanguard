import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MenuItem} from "@services/pages-menu/pages-menu.service";
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-button-with-menu',
  templateUrl: './button-with-menu.component.html',
  styleUrls: ['./button-with-menu.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ButtonWithMenuComponent implements OnInit , OnDestroy {
  private subs = new SubSink();
  @Input() text: string;
  @Input() menu: MenuItem[];

  constructor(
    private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.translateMenuItems()
    this.subs.add(
      this.translate.onLangChange.subscribe(() => {
        this.translateMenuItems()
      })
    )
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
