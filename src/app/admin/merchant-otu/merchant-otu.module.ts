import {NgModule} from '@angular/core';
import {OtuRoutingModule} from './merchant-otu-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListMerchantOtuComponent} from "./list-merchant-otu/list-merchant-otu.component";


@NgModule({
  declarations: [ListMerchantOtuComponent],
  imports: [
    SharedModule,
    OtuRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class MerchantOtuModule {
}
