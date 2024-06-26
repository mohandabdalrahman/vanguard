import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListMerchantDepositsComponent} from "./list-merchant-deposits/list-merchant-deposits.component";
import {FormGuard} from "../../guards/form.guard";
import {CreateMerchantDepositsComponent} from "./create-merchant-deposits/create-merchant-deposits.component";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantDepositsComponent,
    data: {pageTitle: "list merchant deposits"},
  },
  {
    path: "create",
    component: CreateMerchantDepositsComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "create merchant deposit"},
  },
  {
    path: ":merchantDepositId/update",
    component: CreateMerchantDepositsComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "update merchant deposit", view: "update"},
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantDepositsRoutingModule {
}
