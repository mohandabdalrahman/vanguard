import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UnitsComponent} from "./units/units.component";
import {CreateUnitComponent} from "./create-unit/create-unit.component";
import {UpdateUnitComponent} from "./update-unit/update-unit.component";
import {UnitDetailsComponent} from "./unit-details/unit-details.component";
import {UserRoleGuard} from "../../guards/user-role.guard";
import {CorporateRole} from "../corporates/corporate-roles";
import {MainUnitInfoComponent} from "./main-unit-info/main-unit-info.component";
import {BalanceDistributionComponent} from "./balance-distribution/balance-distribution.component";
import { UserAssignmentComponent } from './user-assignment/user-assignment.component';
import { AssetTransferComponent } from './asset-transfer/asset-transfer.component';

const routes: Routes = [
  {
    path: "units",
    component: UnitsComponent,
    data: {pageTitle: "Units"},
  },
  {
    path: 'units',
    children: [
      {
        path: 'create',
        component: CreateUnitComponent,
        data: {pageTitle: "Create Unit"},
      },
      {
        path: 'assignment',
        component: UserAssignmentComponent,
        data: {pageTitle: "user assignment"},
      },
      
      {
        path: 'assetTransfer',
        component: AssetTransferComponent,
        data: {pageTitle: "Asset Transfer"},
      },
      {
        path: ':ouId/update',
        component: UpdateUnitComponent,
        data: {pageTitle: "Update Unit"},
      },
      {
        path: ':ouId/details',
        component: UnitDetailsComponent,
        data: {pageTitle: "Unit Details"},
        children: [
          {
            path: "main-info",
            component: MainUnitInfoComponent,
            data: {pageTitle: "Main Unit Info"},
          },
          {
            path: "users",
            loadChildren: () =>
              import("../corporate-user/corporate-user.module").then(
                (m) => m.CorporateUserModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.USER_LIST, isTabView: true},
          },
          {
            path: "vehicles",
            loadChildren: () =>
              import("../corporate-vehicle/corporate-vehicle.module").then(
                (m) => m.CorporateVehicleModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.ASSET_LIST, isTabView: true},
          },
          {
            path: "hardwares",
            loadChildren: () =>
              import("../corporate-hardware/corporate-hardware.module").then(
                (m) => m.CorporateHardwareModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.ASSET_LIST, isTabView: true},
          },
          {
            path: "containers",
            loadChildren: () =>
              import("../corporate-container/corporate-container.module").then(
                (m) => m.CorporateContainerModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.ASSET_LIST, isTabView: true},
          },
          {
            path: "policies",
            loadChildren: () =>
              import("../corporate-policy/corporate-policy.module").then(
                (m) => m.CorporatePolicyModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.POLICY_LIST, isTabView: true},
          },
          {
            path: "card-holders",
            loadChildren: () =>
              import(
                "../corporate-card-holders/corporate-card-holders.module").then((m) => m.CorporateCardHoldersModule),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.ASSET_LIST, isTabView: true},
          },
          {
            path: "alerts",
            loadChildren: () =>
              import("../corporate-alert/corporate-alert.module").then(
                (m) => m.CorporateAlertModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.ALERT_LIST, isTabView: true},
          },
          {
            path: "transactions",
            loadChildren: () =>
              import("../corporate-transaction/corporate-transaction.module").then(
                (m) => m.CorporateTransactionModule
              ),
            canActivate: [UserRoleGuard],
            data: {role: CorporateRole.TRANSACTION_LIST, isTabView: true},
          },
        ]
      }
    ]
  },
  {
    path:"balance-distribution",
    component: BalanceDistributionComponent,
    data: {pageTitle: "Balance Distribution"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationalChartRoutingModule {
}
