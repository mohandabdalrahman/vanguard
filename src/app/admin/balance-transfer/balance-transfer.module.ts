import { NgModule } from '@angular/core';

import { BalanceTransferRoutingModule } from './balance-transfer-routing.module';
import { CreateBalanceTransferComponent } from './create-balance-transfer/create-balance-transfer.component';
import { NbRadioModule, NbStepperModule, NbTagModule} from "@nebular/theme";

import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";


@NgModule({
  declarations: [
    CreateBalanceTransferComponent
  ],
  imports: [
    SharedModule,
    BalanceTransferRoutingModule,
    NbRadioModule,
    NbStepperModule,
    NbTagModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class BalanceTransferModule { }
