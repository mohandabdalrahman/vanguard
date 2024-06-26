import {NgModule} from '@angular/core';
import {MerchantDepositsRoutingModule} from './merchant-deposits-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListMerchantDepositsComponent} from './list-merchant-deposits/list-merchant-deposits.component';
import {CreateMerchantDepositsComponent} from './create-merchant-deposits/create-merchant-deposits.component';


@NgModule({
  declarations: [
    ListMerchantDepositsComponent,
    CreateMerchantDepositsComponent,
  ],
  imports: [
    SharedModule,
    MerchantDepositsRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class MerchantDepositsModule {
}
