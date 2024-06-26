import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {CorporateVehicleRoutingModule} from "./corporate-vehicle-routing.module";
import {CreateCorporateVehicleComponent} from "./create-corporate-vehicle/create-corporate-vehicle.component";
import {ListCorporateVehiclesComponent} from "./list-corporate-vehicles/list-corporate-vehicles.component";
import {VehicleMainInfo} from './vehicle-main-info/vehicle-main-info';
import {
    NbAccordionModule,
    NbAutocompleteModule,
    NbContextMenuModule, NbListModule,
    NbRadioModule,
    NbStepperModule, NbTagModule
} from "@nebular/theme";
import {CorporateVehicleDetailsComponent} from './corporate-vehicle-details/corporate-vehicle-details.component';
import {VehicleManagementComponent} from './vehicle-management/vehicle-management.component';
import { VehicleDailyPolicyComponent } from './vehicle-daily-policy/vehicle-daily-policy.component';
import { VehicleManualMileageComponent } from './vehicle-manual-mileage/vehicle-manual-mileage.component';
import {VehicleDailyPolicyHeaderComponent} from "./vehicle-daily-policy-header/vehicle-daily-policy-header.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";

@NgModule({
  declarations: [
    ListCorporateVehiclesComponent,
    CreateCorporateVehicleComponent,
    VehicleMainInfo,
    CorporateVehicleDetailsComponent,
    VehicleManagementComponent,
    VehicleDailyPolicyComponent,
    VehicleManualMileageComponent,
    VehicleDailyPolicyHeaderComponent
  ],
    imports: [
        SharedModule,
        CorporateVehicleRoutingModule,
        NbAccordionModule,
        TranslateModule.forChild({extend: true}),
        NbContextMenuModule,
        NbAutocompleteModule,
        NbStepperModule,
        NbRadioModule,
        NbTagModule,
        NbListModule,
        NgxChartsModule
    ],
})
export class CorporateVehicleModule {
}
