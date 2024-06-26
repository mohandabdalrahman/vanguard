import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { AdminInvoicesRoutingModule } from "./admin-invoices-routing.module";
import { ListAdminInvoicesComponent } from './list-admin-invoices/list-admin-invoices.component';
import { AdminInvoiceDetailsComponent } from './admin-invoice-details/admin-invoice-details.component';

@NgModule({
  declarations: [
    ListAdminInvoicesComponent,
    AdminInvoiceDetailsComponent
  ],
  imports: [
    SharedModule,
    AdminInvoicesRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class AdminInvoicesModule {}
