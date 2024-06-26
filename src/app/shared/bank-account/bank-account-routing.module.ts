import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { BankAccountDetailsComponent } from "./bank-account-details/bank-account-details.component";
import { CreateBankAccountComponent } from "./create-bank-account/create-bank-account.component";
import { ListBankAccountComponent } from "./list-bank-account/list-bank-account.component";

const routes: Routes = [
  {
    path: "",
    component: ListBankAccountComponent,
    data: { pageTitle: "bank accounts" },
  },
  {
    path: "create",
    component: CreateBankAccountComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create bank account" },
  },
  {
    path: ":bankId/update",
    component: CreateBankAccountComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update bank account", view: "update" },
  },
  {
    path: ":bankId/details",
    component: BankAccountDetailsComponent,
    data: { pageTitle: "bank account details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankAccountRoutingModule {}
