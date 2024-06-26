import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FormGuard} from "app/guards/form.guard";
import {UserRoleGuard} from "app/guards/user-role.guard";
import {CreateMerchantComponent} from "./create-merchant/create-merchant.component";
import {ListMerchantsComponent} from "./list-merchants/list-merchants.component";
import {MerchantDetailsComponent} from "./merchant-details/merchant-details.component";
import {MerchantRole} from "./merchant-roles";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantsComponent,
    data: { pageTitle: "Merchants" },
  },
  {
    path: "create",
    component: CreateMerchantComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create merchant" },
  },
  {
    path: ":merchantId/update",
    component: CreateMerchantComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update merchant", view: "update" },
  },
  {
    path: ":merchantId/details",
    component: MerchantDetailsComponent,
    data: { pageTitle: "merchant details" },
    children: [
      {
        path: "billing-account",
        loadChildren: () =>
          import(
            "../merchant-billing-account/merchant-billing-account.module"
          ).then((m) => m.MerchantBillingAccountModule),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.USER_LIST},
      },
      {
        path: "reports",
        loadChildren: () =>
          import(
            "../merchant-reports/merchant-reports.module"
          ).then((m) => m.MerchantReportsModule),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.DASHBOARD_VIEW},
      },
      {
        path: "products",
        loadChildren: () =>
          import(
            "../../shared/merchant-products/merchant-products.module"
          ).then((m) => m.MerchantProductsModule),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.PRODUCT_LIST },
      },
      {
        path: "sites",
        loadChildren: () =>
          import("../../shared/sites/sites.module").then((m) => m.SitesModule),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.SITE_LIST },
      },
      {
        path: "bank-accounts",
        loadChildren: () =>
          import(
            "../merchant-bank-accounts/merchant-bank-accounts.module"
          ).then((m) => m.MerchantBankAccountsModule),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.MERCHANT_BANK_ACCOUNT_LIST },
      },
      {
        path: "users",
        loadChildren: () =>
          import("../../shared/merchant-users/merchant-users.module").then(
            (m) => m.MerchantUsersModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.USER_LIST },
      },
      {
        path: "contacts",
        loadChildren: () =>
          import("../../shared/contacts/contacts.module").then(
            (m) => m.ContactsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.MERCHANT_CONTACT_LIST },
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../merchant-invoices/merchant-invoices.module").then(
            (m) => m.MerchantInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.INVOICE_LIST },
      },
      {
        path: "attachments",
        loadChildren: () =>
          import("../../shared/attachments/attachments.module").then(
            (m) => m.AttachmentsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.MERCHANT_DOCUMENT_LIST },
      },
      {
        path: "tokens",
        loadChildren: () =>
          import("../merchant-tokens/merchant-tokens.module").then(
            (m) => m.MerchantTokensModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.NFC_LIST },
      },
      {
        path: "transactions",
        loadChildren: () =>
          import("../merchant-transaction/merchant-transaction.module").then(
            (m) => m.MerchantTransactionModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.TRANSACTION_LIST },
      },
      {
        path: "deposits",
        loadChildren: () =>
          import("../merchant-deposits/merchant-deposits.module").then(
            (m) => m.MerchantDepositsModule
          ),
        canActivate: [UserRoleGuard],
        // data: { role: MerchantRole.TRANSACTION_LIST },
      },
      {
        path: "tips",
        loadChildren: () =>
          import("../merchant-tips/merchant-tips.module").then(
            (m) => m.MerchantTipsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: MerchantRole.TIPS_LIST },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantsRoutingModule {
}
