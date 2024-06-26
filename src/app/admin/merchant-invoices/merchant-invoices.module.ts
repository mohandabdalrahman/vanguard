import {NgModule} from '@angular/core';
import {MerchantInvoicesRoutingModule} from './merchant-invoices-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListMerchantInvoicesComponent} from "./list-merchant-invoices/list-merchant-invoices.component";
import {MerchantInvoiceDetailsComponent} from "./merchant-invoice-details/merchant-invoice-details.component";


@NgModule({
  declarations: [ListMerchantInvoicesComponent, MerchantInvoiceDetailsComponent],
  imports: [
    SharedModule,
    MerchantInvoicesRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class MerchantInvoicesModule {
}
