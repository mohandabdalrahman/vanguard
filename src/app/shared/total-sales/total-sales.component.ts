import {Component, Input, OnInit} from '@angular/core';
import {MerchantSale, TotalSales, TransactionsReportDto} from "@models/reports.model";
import {CurrentLangService} from '@shared/services/current-lang.service';
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-total-sales',
  templateUrl: './total-sales.component.html',
  styleUrls: ['./total-sales.component.scss']
})
export class TotalSalesComponent implements OnInit {
  private subs = new SubSink();
  @Input() merchantSale: MerchantSale;
  @Input() totalSales: TotalSales;
  @Input() TransactionsReportDto: TransactionsReportDto;
  @Input() transactionsItemsReportDta: TransactionsReportDto;
  @Input() reportName: string;
  currentUrl: string;
  currentLang: string;


  constructor(
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
    )
  }

}
