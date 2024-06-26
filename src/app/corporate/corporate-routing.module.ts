import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AccessDeniedComponent} from "app/common/miscellaneous/access-denied/access-denied.component";
import {UserRoleGuard} from "app/guards/user-role.guard";
import {CorporateDetailsComponent} from "../admin/corporates/corporate-details/corporate-details.component";
import {NotFoundComponent} from "../common/miscellaneous/not-found/not-found.component";
import {CorporateComponent} from "./corporate.component";
import {HomeComponent} from "./home/home.component";
import {OuEnableGuard} from "../guards/ou-enable.guard";

const routes: Routes = [
  {
    path: "",
    component: CorporateComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
        data: {pageTitle: "Corporate Home"},
      },
      {
        path: "change-password",
        loadChildren: () =>
          import("../admin/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: "corporates",
        loadChildren: () =>
          import("../admin/corporates/corporates.module").then(
            (m) => m.CorporatesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_LIST"},
      },
      {
        path: "master-corporates",
        loadChildren: () =>
          import("../admin/master-corporates/master-corporates.module").then(
            (m) => m.MasterCorporatesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MASTER_CORPORATE_LIST"},
      },
      {
        path: "billing-account",
        loadChildren: () =>
          import(
            "../admin/corporate-billing-account/corporate-billing-account.module"
            ).then((m) => m.CorporateBillingAccountModule),
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_BILLING_ACCOUNT_VIEW"},
      },
      {
        path: "users",
        loadChildren: () =>
          import("../admin/corporate-user/corporate-user.module").then(
            (m) => m.CorporateUserModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "USER_LIST"},
      },
      {
        path: "contacts",
        loadChildren: () =>
          import("../admin/corporate-contact/corporate-contact.module").then(
            (m) => m.CorporateContactModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_CONTACT_LIST"},
      },
      {
        path: "vehicles",
        loadChildren: () =>
          import("../admin/corporate-vehicle/corporate-vehicle.module").then(
            (m) => m.CorporateVehicleModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "ASSET_LIST"},
      },
      {
        path: "hardwares",
        loadChildren: () =>
          import("../admin/corporate-hardware/corporate-hardware.module").then(
            (m) => m.CorporateHardwareModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "ASSET_LIST"},
      },
      {
        path: "containers",
        loadChildren: () =>
          import(
            "../admin/corporate-container/corporate-container.module"
            ).then((m) => m.CorporateContainerModule),
        canActivate: [UserRoleGuard],
        data: {role: "ASSET_LIST"},
      },
      {
        path: "policies",
        loadChildren: () =>
          import("../admin/corporate-policy/corporate-policy.module").then(
            (m) => m.CorporatePolicyModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "POLICY_LIST"},
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../admin/corporate-invoices/corporate-invoices.module").then(
            (m) => m.CorporateInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "INVOICE_LIST"},
      },
      {
        path: "bills",
        loadChildren: () =>
          import("../admin/corporate-bills/corporate-bills.module").then(
            (m) => m.CorporateBillsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "BILL_LIST"},
      },
      {
        path: "card-holder",
        loadChildren: () =>
          import(
            "../admin/corporate-card-holders/corporate-card-holders.module"
            ).then((m) => m.CorporateCardHoldersModule),
        canActivate: [UserRoleGuard],
        data: {role: "ASSET_LIST"},
      },
      {
        path: "reports",
        loadChildren: () =>
          import("../admin/corporate-reports/corporate-reports.module").then(
            (m) => m.CorporateReportsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "SALES_VIEW"},
      },
      {
        path: "transactions",
        loadChildren: () =>
          import(
            "../admin/corporate-transaction/corporate-transaction.module"
            ).then((m) => m.CorporateTransactionModule),
        canActivate: [UserRoleGuard],
        data: {role: "TRANSACTION_LIST"},
      },
      {
        path: "alerts",
        loadChildren: () =>
          import("../admin/corporate-alert/corporate-alert.module").then(
            (m) => m.CorporateAlertModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "ALERT_LIST"},
      },
      {
        path: "attachments",
        loadChildren: () =>
          import("../shared/attachments/attachments.module").then(
            (m) => m.AttachmentsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_DOCUMENT_LIST"},
      },
      {
        path: "account-info",
        component: CorporateDetailsComponent,
        data: {
          pageTitle: "Account Info",
          role: "CORPORATE_VIEW",
        },
        canActivate: [UserRoleGuard],
      },
      {
        path: "organizational-chart",
        loadChildren: () =>
          import("../admin/organizational-chart/organizational-chart.module").then(
            (m) => m.OrganizationalChartModule
          ),
        canActivate: [UserRoleGuard, OuEnableGuard],
        data: {role: "OU_VIEW"},
      },
      {
        path: "balance-transfer",
        loadChildren: () =>
          import("../admin/balance-transfer/balance-transfer.module").then(
            (m) => m.BalanceTransferModule
          ),
        canActivate: [UserRoleGuard, OuEnableGuard],
        data: {role: "OU_BALANCE_TRANSFER"},
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
export class CorporateRoutingModule {
}
