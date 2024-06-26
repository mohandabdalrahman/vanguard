import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { MerchantTransactionRoutingModule } from "./merchant-transaction-routing.module";
import { ListMerchantTransactionComponent } from "./list-merchant-transaction/list-merchant-transaction.component";
import { MerchantTransactionDetailsComponent } from './merchant-transaction-details/merchant-transaction-details.component';
import {NbCardModule} from "@nebular/theme";

@NgModule({
  declarations: [ListMerchantTransactionComponent, MerchantTransactionDetailsComponent],
  imports: [
    SharedModule,
    NbCardModule,
    MerchantTransactionRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MerchantTransactionModule {}
