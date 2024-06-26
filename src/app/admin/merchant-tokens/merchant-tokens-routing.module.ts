import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListMerchantTokensComponent} from "./list-merchant-tokens/list-merchant-tokens.component";

const routes: Routes = [
  {
    path: '',
    component: ListMerchantTokensComponent,
    data: {pageTitle: "Merchant tokens"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantTokensRoutingModule {
}
