import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListMerchantTipsComponent} from "./list-merchant-tips/list-merchant-tips.component";

const routes: Routes = [
  {
    path: '',
    component: ListMerchantTipsComponent,
    data: {pageTitle: "Merchant Tips"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantTokensRoutingModule {
}
