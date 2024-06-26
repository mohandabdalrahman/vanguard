import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CreateMerchantBankAccountComponent } from "./create-merchant-bank-account/create-merchant-bank-account.component";
import { ListMerchantBankAccountsComponent } from "./list-merchant-bank-accounts/list-merchant-bank-accounts.component";
import { MerchantBankAccountDetailsComponent } from "./merchant-bank-account-details/merchant-bank-account-details.component";
import { MerchantBankAccountsRoutingModule } from "./merchant-bank-accounts-routing.module";

@NgModule({
  declarations: [
    ListMerchantBankAccountsComponent,
    CreateMerchantBankAccountComponent,
    MerchantBankAccountDetailsComponent,
  ],
  imports: [
    SharedModule,
    MerchantBankAccountsRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MerchantBankAccountsModule {}
