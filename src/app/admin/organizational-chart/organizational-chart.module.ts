import {NgModule} from '@angular/core';

import {OrganizationalChartRoutingModule} from './organizational-chart-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {UnitsComponent} from './units/units.component';
import {CreateUnitComponent} from './create-unit/create-unit.component';
import {NbListModule, NbRadioModule, NbStepperModule, NbTagModule, NbToggleModule} from "@nebular/theme";
import {CorporateUserModule} from "../corporate-user/corporate-user.module";
import {OrgChartModule} from "angular13-organization-chart";
import {OuHeaderComponent} from './ou-header/ou-header.component';
import {ParentCardComponent} from './parent-card/parent-card.component';
import { UpdateUnitComponent } from './update-unit/update-unit.component';
import { UnitDetailsComponent } from './unit-details/unit-details.component';
import { MainUnitInfoComponent } from './main-unit-info/main-unit-info.component';
import { BalanceDistributionComponent } from './balance-distribution/balance-distribution.component';
import { UserAssignmentComponent } from './user-assignment/user-assignment.component';
import { AssetTransferComponent } from './asset-transfer/asset-transfer.component';

@NgModule({
  declarations: [
    UnitsComponent,
    CreateUnitComponent,
    OuHeaderComponent,
    ParentCardComponent,
    UpdateUnitComponent,
    UnitDetailsComponent,
    MainUnitInfoComponent,
    BalanceDistributionComponent,
    UserAssignmentComponent,
    AssetTransferComponent
  ],
  imports: [
    SharedModule,
    OrganizationalChartRoutingModule,
    TranslateModule.forChild({extend: true}),
    NbStepperModule,
    NbRadioModule,
    CorporateUserModule,
    OrgChartModule,
    NbListModule,
    NbTagModule,
    NbToggleModule
  ]
})
export class OrganizationalChartModule {
}
