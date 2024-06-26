import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListCorporateInvoicesComponent} from "./list-corporate-invoices/list-corporate-invoices.component";
import {CorporateInvoiceDetailsComponent} from "./corporate-invoice-details/corporate-invoice-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateInvoicesComponent,
    data: {pageTitle: "corporate invoices"},
  },
  {
    path: ":invoiceId/details",
    component: CorporateInvoiceDetailsComponent,
    data: {pageTitle: "corporate invoice details"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateInvoicesRoutingModule {
}
