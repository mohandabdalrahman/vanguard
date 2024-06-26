import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListMerchantOtuComponent} from "./list-merchant-otu/list-merchant-otu.component";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantOtuComponent,
    data: {pageTitle: "Otus"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtuRoutingModule {
}
