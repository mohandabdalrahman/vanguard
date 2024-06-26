import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateBillingAccountComponent} from './create-billing-account/create-billing-account.component';
import {TopUpComponent} from './top-up/top-up.component';
import {BillingAccountDetailsComponent} from './billing-account-details/billing-account-details.component'
import {FormGuard} from "../../guards/form.guard";

const routes: Routes = [
  {
    path: "",
    component: BillingAccountDetailsComponent,
    data: {pageTitle: "Corporate Billing Account"},
  },
  {
    path: "create",
    component: CreateBillingAccountComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "Add Billing Account"},
  },
  {
    path: "update",
    component: CreateBillingAccountComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "Update Billing Account", view: "update"},
  },
  {
    path: "topup",
    component: TopUpComponent,
    data: {pageTitle: "Update Topup", view: "update"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateBillingAccountRoutingModule {
}
