import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { TranslateService } from "@ngx-translate/core";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { SubSink } from "subsink";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: "balance-details-drawer",
  templateUrl: "./balance-details-drawer.component.html",
  styleUrls: ["./balance-details-drawer.component.scss"],
})
export class BalanceDetailsDrawerComponent implements OnInit {
  private subs = new SubSink();
  currentLang: string;
  @Output() onCloseDrawer = new EventEmitter();
  @Input() node: any;
  @Input() showDrawer: boolean;
  
  corporateId:number;
  bufferBalance: number;
  currentBalance: number;
  selfAmount: number;
  

  constructor(
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.corporateId = +getRelatedSystemId(null, "corporateId");

    //if (this.showDrawer) {
      
    //}
    this.subs.add(
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang;
    }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.bufferBalance = this.node?.data?.bufferBalance,
      this.currentBalance = this.node?.data?.currentBalance,
      this.selfAmount = this.node?.data?.selfAmount
    )
    
  }

  closeDrawer() {
    this.onCloseDrawer.emit();
  }

  getBufferBalance(): number{
    return this.node?.data?.bufferBalance;
  }

  getCurrentBalance(): number{
    return this.node?.data?.currentBalance;
  }

  

}
