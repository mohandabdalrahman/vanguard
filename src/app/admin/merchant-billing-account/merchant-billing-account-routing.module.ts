import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BillingAccountDetailsComponent} from './billing-account-details/billing-account-details.component'

const routes: Routes = [
  {
    path: "",
    component: BillingAccountDetailsComponent,
    data: {pageTitle: "Merchant Billing Account"},
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantBillingAccountRoutingModule { }
