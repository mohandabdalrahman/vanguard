import {NgModule} from '@angular/core';
import {CorporateInvoicesRoutingModule} from './corporate-invoices-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import { ListCorporateInvoicesComponent } from './list-corporate-invoices/list-corporate-invoices.component';
import { CorporateInvoiceDetailsComponent } from './corporate-invoice-details/corporate-invoice-details.component';

@NgModule({
  declarations: [
    ListCorporateInvoicesComponent,
    CorporateInvoiceDetailsComponent
  ],
  imports: [
    SharedModule,
    CorporateInvoicesRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class CorporateInvoicesModule {
}
