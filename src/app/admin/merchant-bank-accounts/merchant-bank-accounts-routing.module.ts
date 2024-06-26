import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CreateMerchantBankAccountComponent } from './create-merchant-bank-account/create-merchant-bank-account.component';
import { ListMerchantBankAccountsComponent } from './list-merchant-bank-accounts/list-merchant-bank-accounts.component';
import { MerchantBankAccountDetailsComponent } from './merchant-bank-account-details/merchant-bank-account-details.component';

const routes: Routes = [
  {
    path: "",
    component: ListMerchantBankAccountsComponent,
    data: { pageTitle: "Merchant Bank Accounts" },
  },
  {
    path: "create",
    component: CreateMerchantBankAccountComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create merchant bank account" },
  },
  {
    path: ":merchantBankAccountId/update",
    component: CreateMerchantBankAccountComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update merchant bank account", view: "update" },
  },
  {
    path: ":merchantBankAccountId/details",
    component: MerchantBankAccountDetailsComponent,
    data: { pageTitle: "merchant bank account details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantBankAccountsRoutingModule {}
