import {NgModule} from '@angular/core';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {BillingAccountDetailsComponent} from './billing-account-details/billing-account-details.component';
import {MerchantBillingAccountRoutingModule} from './merchant-billing-account-routing.module';

@NgModule({
  declarations: [ BillingAccountDetailsComponent ],
  imports: [
    MerchantBillingAccountRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true })
  ]
})
export class MerchantBillingAccountModule { }
