import {NgModule} from '@angular/core';

import {MerchantTokensRoutingModule} from './merchant-tokens-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListMerchantTokensComponent} from './list-merchant-tokens/list-merchant-tokens.component';


@NgModule({
  declarations: [
    ListMerchantTokensComponent
  ],
  imports: [
    SharedModule,
    MerchantTokensRoutingModule,
    TranslateModule.forChild({extend: true}),

  ]
})
export class MerchantTokensModule {
}
