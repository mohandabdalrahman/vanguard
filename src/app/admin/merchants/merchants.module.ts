import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {CreateMerchantComponent} from "./create-merchant/create-merchant.component";
import {ListMerchantsComponent} from "./list-merchants/list-merchants.component";
import {MerchantDetailsComponent} from "./merchant-details/merchant-details.component";
import {MerchantsRoutingModule} from "./merchants-routing.module";
import {ThemeModule} from "@theme/theme.module";
import {NbRadioModule} from "@nebular/theme";

@NgModule({
  declarations: [
    ListMerchantsComponent,
    CreateMerchantComponent,
    MerchantDetailsComponent,
  ],
  imports: [
    ThemeModule,
    MerchantsRoutingModule,
    SharedModule,
    TranslateModule.forChild({extend: true}),
    NbRadioModule,
  ],
})
export class MerchantsModule {
}
