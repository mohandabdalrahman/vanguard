import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-list-sales",
  templateUrl: "./list-sales.component.html",
  styleUrls: ["./list-sales.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListSalesComponent implements OnInit {
  private subs = new SubSink();

  saleCards = [];
  currentLang: string;

  constructor(private route: ActivatedRoute, private currentLangService: CurrentLangService, private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.saleCards = this.route.snapshot.data["saleCards"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
    );
  }
}
