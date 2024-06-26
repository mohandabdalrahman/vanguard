import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from "app/guards/form.guard";
import { UserRoleGuard } from "app/guards/user-role.guard";
import { AddCorporateComponent } from "./add-corporate/add-corporate.component";
import { CorporateDetailsComponent } from "./corporate-details/corporate-details.component";
import { CorporateRole } from "./corporate-roles";
import { ListCorporatesComponent } from "./list-corporates/list-corporates.component";
import { HomeComponent } from "../../corporate/home/home.component";
import { CreateBalanceTransferComponent } from "../balance-transfer/create-balance-transfer/create-balance-transfer.component";
import { AssetTransferComponent } from "../organizational-chart/asset-transfer/asset-transfer.component";
import { UserAssignmentComponent } from "../organizational-chart/user-assignment/user-assignment.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporatesComponent,
    data: { pageTitle: "corporates" },
  },
  {
    path: "create",
    component: AddCorporateComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "add corporate" },
  },
  {
    path: ":corporateId/balance-transfer",
    component:CreateBalanceTransferComponent,
    canActivate: [UserRoleGuard],
    data: {role: "OU_BALANCE_TRANSFER"},
  },
  {
    path: ':corporateId/assignment',
    component:UserAssignmentComponent,
    canActivate: [UserRoleGuard],
    data: {pageTitle: "user assignment"},
  },
  {
    path: ":corporateId/update",
    component: AddCorporateComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate", view: "update" },
  },
  {
    path: ':corporateId/assetTransfer',
    component:AssetTransferComponent,
    canActivate: [UserRoleGuard],
    data: {pageTitle: "Asset Transfer"},
  },
  {
    path: ":corporateId/details",
    component: CorporateDetailsComponent,
    data: { pageTitle: "corporate details" },
    children: [
      {
        path: "billing-account",
        loadChildren: () =>
          import(
            "../corporate-billing-account/corporate-billing-account.module"
          ).then((m) => m.CorporateBillingAccountModule),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.CORPORATE_BILLING_ACCOUNT_VIEW },
      },
      {
        path: "users",
        loadChildren: () =>
          import("../corporate-user/corporate-user.module").then(
            (m) => m.CorporateUserModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.USER_LIST , isTabView:true },
      },
      {
        path: "contacts",
        loadChildren: () =>
          import("../corporate-contact/corporate-contact.module").then(
            (m) => m.CorporateContactModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.CORPORATE_CONTACT_LIST },
      },
      {
        path: "vehicles",
        loadChildren: () =>
          import("../corporate-vehicle/corporate-vehicle.module").then(
            (m) => m.CorporateVehicleModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.ASSET_LIST },
      },
      {
        path: "hardwares",
        loadChildren: () =>
          import("../corporate-hardware/corporate-hardware.module").then(
            (m) => m.CorporateHardwareModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.ASSET_LIST },
      },
      {
        path: "containers",
        loadChildren: () =>
          import("../corporate-container/corporate-container.module").then(
            (m) => m.CorporateContainerModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.ASSET_LIST },
      },
      {
        path: "policies",
        loadChildren: () =>
          import("../corporate-policy/corporate-policy.module").then(
            (m) => m.CorporatePolicyModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.POLICY_LIST },
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../corporate-invoices/corporate-invoices.module").then(
            (m) => m.CorporateInvoicesModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.INVOICE_LIST },
      },
      {
        path: "card-holders",
        loadChildren: () =>
          import(
            "../corporate-card-holders/corporate-card-holders.module"
          ).then((m) => m.CorporateCardHoldersModule),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.ASSET_LIST },
      },
      {
        path: "bills",
        loadChildren: () =>
          import("../corporate-bills/corporate-bills.module").then(
            (m) => m.CorporateBillsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.BILL_LIST, view: "tabs" },
      },
      {
        path: "transactions",
        loadChildren: () =>
          import("../corporate-transaction/corporate-transaction.module").then(
            (m) => m.CorporateTransactionModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.TRANSACTION_LIST },
      },
      
      {
        path: "attachments",
      loadChildren: () =>
      import("../../shared/attachments/attachments.module").then(
      (m) => m.AttachmentsModule
      ),
      canActivate: [UserRoleGuard],
      data: { role: CorporateRole.CORPORATE_DOCUMENT_LIST },
      },
      {
        path: "alerts",
        loadChildren: () =>
          import("../corporate-alert/corporate-alert.module").then(
            (m) => m.CorporateAlertModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.ALERT_LIST, view: "tabs" },
      },
      {
        path: "reports",
        loadChildren: () =>
          import("../corporate-reports/corporate-reports.module").then(
            (m) => m.CorporateReportsModule
          ),
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.SALES_VIEW },
      },
      {
        path: "dashboard",
        component: HomeComponent,
        canActivate: [UserRoleGuard],
        data: { role: CorporateRole.DASHBOARD_VIEW },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporatesRoutingModule {}
