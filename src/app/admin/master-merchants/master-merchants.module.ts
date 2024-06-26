import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../shared/shared.module";
import { CreateMasterMerchantComponent } from "./create-master-merchant/create-master-merchant.component";
import { ListMasterMerchantsComponent } from "./list-master-merchants/list-master-merchants.component";
import { MasterMerchantDetailsComponent } from "./master-merchant-details/master-merchant-details.component";
import { MasterMerchantsRoutingModule } from "./master-merchants-routing.module";

@NgModule({
  declarations: [
    ListMasterMerchantsComponent,
    CreateMasterMerchantComponent,
    MasterMerchantDetailsComponent,
  ],
  imports: [
    MasterMerchantsRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MasterMerchantsModule {}
