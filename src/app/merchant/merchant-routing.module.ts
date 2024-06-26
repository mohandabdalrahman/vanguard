import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {MerchantComponent} from "./merchant.component";
import {MerchantDetailsComponent} from "../admin/merchants/merchant-details/merchant-details.component";
import {NotFoundComponent} from "../common/miscellaneous/not-found/not-found.component";
import {AccessDeniedComponent} from 'app/common/miscellaneous/access-denied/access-denied.component';
import {UserRoleGuard} from 'app/guards/user-role.guard';
import { BillingAccountDetailsComponent } from "app/admin/merchant-billing-account/billing-account-details/billing-account-details.component";

const routes: Routes = [
  {
    path: "",
    component: MerchantComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
        data: {pageTitle: "Merchant Home", role: "DASHBOARD_VIEW"},
        canActivate: [UserRoleGuard],
      },
      {
        path: "billing-account",
        component: BillingAccountDetailsComponent,
        data: {pageTitle: "Billing Account", role: "MERCHANT_BILLING_ACCOUNT_VIEW"},
        canActivate: [UserRoleGuard],
      },
      {
        path: "change-password",
        loadChildren: () =>
          import("../admin/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: "sites",
        loadChildren: () =>
          import("../shared/sites/sites.module").then((m) => m.SitesModule),
        canActivate: [UserRoleGuard],
        data: {role: "SITE_LIST"},
      },
      {
        path: "bank-accounts",
        loadChildren: () =>
          import(
            "../admin/merchant-bank-accounts/merchant-bank-accounts.module"
            ).then((m) => m.MerchantBankAccountsModule),
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_BANK_ACCOUNT_LIST"},
      },
      {
        path: "users",
        loadChildren: () =>
          import("../shared/merchant-users/merchant-users.module").then(
            (m) => m.MerchantUsersModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "USER_LIST"},
      },
      {
        path: "products",
        loadChildren: () =>
          import("../shared/merchant-products/merchant-products.module").then(
            (m) => m.MerchantProductsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "PRODUCT_LIST"},
      },
      {
        path: "contacts",
        loadChildren: () =>
          import("../shared/contacts/contacts.module").then(
            (m) => m.ContactsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_CONTACT_LIST"},
      },
      //TODO: FIX FOLDER STRUCTURE
      {
        path: "merchants",
        loadChildren: () =>
          import("../admin/merchants/merchants.module").then(
            (m) => m.MerchantsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_LIST"},
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../admin/merchant-invoices/merchant-invoices.module").then(
            (m) => m.MerchantInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "INVOICE_LIST"},
      },
      {
        path: "account-info",
        component: MerchantDetailsComponent,
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_VIEW", pageTitle: "merchant details"},
      },
      {
        path: "merchant-sales",
        loadChildren: () =>
          import("../admin/merchant-reports/merchant-reports.module").then(
            (m) => m.MerchantReportsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "SALES_VIEW"},
      },
      {
        path: "attachments",
        loadChildren: () =>
          import("../shared/attachments/attachments.module").then(
            (m) => m.AttachmentsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_DOCUMENT_LIST"},
      },
      {
        path: "transactions",
        loadChildren: () =>
          import(
            "../admin/merchant-transaction/merchant-transaction.module"
            ).then((m) => m.MerchantTransactionModule),
        canActivate: [UserRoleGuard],
        data: {role: "TRANSACTION_LIST"},
      },
      {
        path: "tokens",
        loadChildren: () =>
          import("../admin/merchant-tokens/merchant-tokens.module").then(
            (m) => m.MerchantTokensModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "NFC_LIST"},
      },
      {
        path: "deposits",
        loadChildren: () =>
          import("../admin/merchant-deposits/merchant-deposits.module").then(
            (m) => m.MerchantDepositsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "NFC_LIST"},
      },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full",
      },
      {
        path: "access-denied",
        component: AccessDeniedComponent,
      },
      {
        path: "**",
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantRoutingModule {
}
