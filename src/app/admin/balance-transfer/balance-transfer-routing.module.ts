import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CreateBalanceTransferComponent} from "./create-balance-transfer/create-balance-transfer.component";

const routes: Routes = [
  {
    path: "",
    component: CreateBalanceTransferComponent,
    data: { pageTitle: "create balance transfer" },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BalanceTransferRoutingModule { }
