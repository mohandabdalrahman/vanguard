import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ListAdminInvoicesComponent} from "./list-admin-invoices/list-admin-invoices.component";
import {AdminInvoiceDetailsComponent} from "./admin-invoice-details/admin-invoice-details.component";


const routes: Routes = [
  {
    path: "",
    component: ListAdminInvoicesComponent,
    data: {
      pageTitle: "Admin Invoices",
    },
  },
  {
    path: ":invoiceId/userTypeId/:userTypeId/details",
    component: AdminInvoiceDetailsComponent,
    data: {pageTitle: "admin invoice details"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminInvoicesRoutingModule {}
