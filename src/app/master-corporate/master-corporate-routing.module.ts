import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MasterCorporateComponent } from "./master-corporate.component";
import { HomeComponent } from "./home/home.component";
import { AccessDeniedComponent } from "../common/miscellaneous/access-denied/access-denied.component";
import { NotFoundComponent } from "../common/miscellaneous/not-found/not-found.component";
import { UserRoleGuard } from "../guards/user-role.guard";
import { TopupComponent } from "../admin/corporate-reports/topup/topup.component";

const routes: Routes = [
  {
    path: "",
    component: MasterCorporateComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
        data: { pageTitle: "master Corporate Home", role: "DASHBOARD_VIEW" },
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
        data: { role: "CORPORATE_LIST" },
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../admin/admin-invoices/admin-invoices.module").then(
            (m) => m.AdminInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: "INVOICE_LIST" },
      },
      {
        path: "bills",
        loadChildren: () =>
          import("../admin/corporate-bills/corporate-bills.module").then(
            (m) => m.CorporateBillsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: "BILL_LIST" },
      },
      {
        path: "reports",
        loadChildren: () =>
          import("../admin/admin-reports/admin-reports.module").then(
            (m) => m.AdminReportsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: "SALES_VIEW" },
      },
      {
        path: "transactions",
        loadChildren: () =>
          import("../admin/admin-transaction/admin-transaction.module").then(
            (m) => m.AdminTransactionModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: "TRANSACTION_LIST" },
      },
      {
        path: "alerts",
        loadChildren: () =>
          import("../admin/corporate-alert/corporate-alert.module").then(
            (m) => m.CorporateAlertModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: "ALERT_LIST" },
      },
      {
        path: "top-ups",
        component: TopupComponent,
        canActivate: [UserRoleGuard],
        data: { role: "CORPORATE_BILLING_ACCOUNT_VIEW", view:'master_corporate' },
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
export class MasterCorporateRoutingModule {}
