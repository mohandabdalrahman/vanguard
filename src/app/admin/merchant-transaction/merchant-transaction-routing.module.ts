import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ListMerchantTransactionComponent} from "./list-merchant-transaction/list-merchant-transaction.component";
import {
  MerchantTransactionDetailsComponent
} from "./merchant-transaction-details/merchant-transaction-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantTransactionComponent,
    data: {pageTitle: "merchant transactions"},
  },
  {
    path: ":transactionId/details",
    component: MerchantTransactionDetailsComponent,
    data: {pageTitle: "merchant transaction details"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantTransactionRoutingModule {
}
