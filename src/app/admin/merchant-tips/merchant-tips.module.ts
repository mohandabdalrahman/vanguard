import {NgModule} from '@angular/core';

import {MerchantTokensRoutingModule} from './merchant-tips-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import { ListMerchantTipsComponent } from './list-merchant-tips/list-merchant-tips.component';


@NgModule({
  declarations: [
    ListMerchantTipsComponent
  ],
  imports: [
    SharedModule,
    MerchantTokensRoutingModule,
    TranslateModule.forChild({extend: true}),

  ]
})
export class MerchantTipsModule {
}
