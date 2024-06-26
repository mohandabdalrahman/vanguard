import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorService} from "@shared/services/error.service";
import {MerchantService} from "../../merchants/merchant.service";
import {SubSink} from "subsink";
import {Merchant} from "../../merchants/merchant.model";
import {getRelatedSystemId} from "@helpers/related-systemid";
import { CurrentLangService } from '@shared/services/current-lang.service';

@Component({
  selector: 'app-merchant-info',
  templateUrl: './merchant-info.component.html',
  styleUrls: ['./merchant-info.component.scss']
})
export class MerchantInfoComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchant: Merchant;
  merchantId: number;
  currentLang: string;
  merchantName: string;

  constructor(
    
    private errorService: ErrorService,
    private merchantService: MerchantService,
    private currentLangService: CurrentLangService
  ) {
    this.merchantId = +getRelatedSystemId(null, "merchantId");
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    if (this.merchantId) {
      this.getMerchant()
    }
  }

  getMerchant() {
    
    this.subs.add(
      this.merchantService
        .getMerchant(this.merchantId)
        .subscribe(
          (merchant: Merchant) => {
            if (merchant) {
              this.merchant = merchant;
              this.merchantName = this.currentLang === "en" ? (merchant?.enName ?? "") : (merchant?.localeName??"");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
