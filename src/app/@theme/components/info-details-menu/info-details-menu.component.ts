import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrentLangService } from '@shared/services/current-lang.service';

@Component({
  selector: 'app-info-details-menu',
  templateUrl: './info-details-menu.component.html',
  styleUrls: ['./info-details-menu.component.scss']
})
export class InfoDetailsMenuComponent implements OnInit {
  @Input() UpdateLink:string;
  openDropMenu: boolean = false;
  currentLang:string;

  constructor(private currentLangService: CurrentLangService,private translate: TranslateService) { }


  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.translate.onLangChange.subscribe(({lang}) => {
      this.currentLang = lang;
  })

}
}