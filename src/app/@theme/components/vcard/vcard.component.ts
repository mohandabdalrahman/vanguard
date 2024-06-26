import { Component, OnInit,Input } from '@angular/core';
import { VcardInfo } from './vcard.model';
import { CurrentLangService } from "@shared/services/current-lang.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-vcard',
  templateUrl: './vcard.component.html',
  styleUrls: ['./vcard.component.scss']
})
export class VcardComponent implements OnInit {
  @Input() vcardInfo:VcardInfo
  currentLang: string;

  constructor(
    private translate: TranslateService,
    private currentLangService: CurrentLangService,) { }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang;
    })
  }

}
