import { NgModule } from '@angular/core';
import { SharedModule } from "@shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { CorporateBillingAccountRoutingModule } from './corporate-billing-account-routing.module';
import { BillingAccountDetailsComponent } from './billing-account-details/billing-account-details.component';
import { CreateBillingAccountComponent} from './create-billing-account/create-billing-account.component';
import { TopUpComponent } from './top-up/top-up.component' ;

@NgModule({
  declarations: [
    BillingAccountDetailsComponent,
    CreateBillingAccountComponent,
    TopUpComponent
  ],
  imports: [
    CorporateBillingAccountRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true })
  ]
})
export class CorporateBillingAccountModule { }
