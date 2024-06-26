import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from '@shared/shared.module';
import { BankAccountDetailsComponent } from "./bank-account-details/bank-account-details.component";
import { BankAccountRoutingModule } from "./bank-account-routing.module";
import { CreateBankAccountComponent } from "./create-bank-account/create-bank-account.component";
import { ListBankAccountComponent } from "./list-bank-account/list-bank-account.component";


@NgModule({
  declarations: [
    BankAccountDetailsComponent,
    CreateBankAccountComponent,
    ListBankAccountComponent,
  ],
  imports: [
    BankAccountRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class BankAccountModule {}
