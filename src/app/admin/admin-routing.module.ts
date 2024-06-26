import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AccessDeniedComponent} from "app/common/miscellaneous/access-denied/access-denied.component";
import {UserRoleGuard} from "app/guards/user-role.guard";
import {NotFoundComponent} from "../common/miscellaneous/not-found/not-found.component";
import {AdminComponent} from "./admin.component";
import {AdminHomeComponent} from "./home/admin-home.component";
import {TopupComponent} from "./corporate-reports/topup/topup.component";
import {OuEnableGuard} from "../guards/ou-enable.guard";

const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    children: [
      {
        path: "home",
        component: AdminHomeComponent,
        canActivate: [UserRoleGuard],
        data: {pageTitle: "Home", role: "DASHBOARD_VIEW"},
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./admin-reports/admin-reports.module").then(
            (m) => m.AdminReportsModule
          ),
      },
      {
        path: "requests",
        loadChildren: () =>
          import("./pending-requests/pending-requests.module").then(
            (m) => m.PendingRequestsModule
          ),
      },
      {
        path: "change-password",
        loadChildren: () =>
          import("./settings/settings.module").then((m) => m.SettingsModule),
      },
      {
        path: "merchants",
        loadChildren: () =>
          import("./merchants/merchants.module").then((m) => m.MerchantsModule),
        canActivate: [UserRoleGuard],
        data: {role: "MERCHANT_LIST"},
      },
      {
        path: "banks",
        loadChildren: () =>
          import("../shared/bank-account/bank-account.module").then(
            (m) => m.BankAccountModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "BANK_LIST"},
      },
      {
        path: "master-merchants",
        loadChildren: () =>
          import("./master-merchants/master-merchants.module").then(
            (m) => m.MasterMerchantsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MASTER_MERCHANT_LIST"},
      },
      {
        path: "product-category",
        loadChildren: () =>
          import("./product/product-category/product-category.module").then(
            (m) => m.ProductCategoryModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "PRODUCT_CATEGORY_LIST"},
      },
      {
        path: "global-product",
        loadChildren: () =>
          import("./product/global-product/global-product.module").then(
            (m) => m.GlobalProductModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "PRODUCT_LIST"},
      },
      {
        path: "user-roles",
        loadChildren: () =>
          import("./user-roles/user-roles.module").then(
            (m) => m.UserRolesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "ROLE_LIST"},
      },
      {
        path: "users",
        loadChildren: () =>
          import("./user-management/users.module").then((m) => m.UsersModule),
        canActivate: [UserRoleGuard],
        data: {role: "USER_LIST"},
      },
      {
        path: "countries",
        loadChildren: () =>
          import("./countries/countries.module").then((m) => m.CountriesModule),
        canActivate: [UserRoleGuard],
        data: {role: "COUNTRY_LIST"},
      },
      {
        path: "countries/:countryId/cities",
        loadChildren: () =>
          import("./cities/cities.module").then((m) => m.CitiesModule),
        canActivate: [UserRoleGuard],
        data: {role: "CITY_LIST"},
      },
      {
        path: "countries/:countryId/cities/:cityId/zones",
        loadChildren: () =>
          import("./zones/zones.module").then((m) => m.ZonesModule),
        canActivate: [UserRoleGuard],
        data: {role: "ZONE_LIST"},
      },
      {
        path: "corporates",
        loadChildren: () =>
          import("./corporates/corporates.module").then(
            (m) => m.CorporatesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_LIST"},
      },
      {
        path: "master-corporates",
        loadChildren: () =>
          import("./master-corporates/master-corporates.module").then(
            (m) => m.MasterCorporatesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "MASTER_CORPORATE_LIST"},
      },
      {
        path: "transactions",
        loadChildren: () =>
          import("./admin-transaction/admin-transaction.module").then(
            (m) => m.AdminTransactionModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "TRANSACTION_LIST"},
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("./admin-invoices/admin-invoices.module").then(
            (m) => m.AdminInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "INVOICE_LIST"},
      },
      {
        path: "deposits",
        loadChildren: () =>
          import("./merchant-deposits/merchant-deposits.module").then(
            (m) => m.MerchantDepositsModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "INVOICE_LIST"},
      },
      {
        path: "corporates/:corporateId/organizational-chart",
        loadChildren: () => import("./organizational-chart/organizational-chart.module").then((m) => m.OrganizationalChartModule),
        canActivate: [UserRoleGuard , OuEnableGuard],
        data: {role: "OU_VIEW"},
      },
      {
        path: "top-ups",
        component: TopupComponent,
        canActivate: [UserRoleGuard],
        data: {role: "CORPORATE_BILLING_ACCOUNT_VIEW", view: 'admin'},
      },
      {
        path: "otus",
        loadChildren: () =>
          import("./merchant-otu/merchant-otu.module").then(
            (m) => m.MerchantOtuModule
          ),
        canActivate: [UserRoleGuard],
        data: {role: "OTU_VIEW"},
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
export class AdminRoutingModule {
}
