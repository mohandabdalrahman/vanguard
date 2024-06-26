import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListMerchantInvoicesComponent} from "./list-merchant-invoices/list-merchant-invoices.component";
import {MerchantInvoiceDetailsComponent} from "./merchant-invoice-details/merchant-invoice-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantInvoicesComponent,
    data: {pageTitle: "merchant invoices"},
  },
  {
    path: ":invoiceId/details",
    component: MerchantInvoiceDetailsComponent,
    data: {pageTitle: "merchant invoice details"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantInvoicesRoutingModule {
}
