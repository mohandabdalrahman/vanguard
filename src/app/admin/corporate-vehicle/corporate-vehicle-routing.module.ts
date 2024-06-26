import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FormGuard} from 'app/guards/form.guard';
import {VehicleMainInfo} from "./vehicle-main-info/vehicle-main-info";
import {CreateCorporateVehicleComponent} from "./create-corporate-vehicle/create-corporate-vehicle.component";
import {ListCorporateVehiclesComponent} from "./list-corporate-vehicles/list-corporate-vehicles.component";
import {SelectedOuNodeGuard} from "../../guards/selected-ouNode.guard";
import {CorporateVehicleDetailsComponent} from "./corporate-vehicle-details/corporate-vehicle-details.component";
import {VehicleManagementComponent} from "./vehicle-management/vehicle-management.component";
import {VehicleDailyPolicyComponent} from "./vehicle-daily-policy/vehicle-daily-policy.component";
import {VehicleManualMileageComponent} from "./vehicle-manual-mileage/vehicle-manual-mileage.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateVehiclesComponent,
    data: {pageTitle: "corporate vehicle"},
  },
  {
    path: "create",
    component: CreateCorporateVehicleComponent,
    canDeactivate: [FormGuard],
    canActivate: [SelectedOuNodeGuard],
    data: {pageTitle: "create corporate vehicle"},
  },
  {
    path: ":corporateVehicleId/update",
    component: CreateCorporateVehicleComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "update corporate vehicle", view: "update"},
  },
  {
    path: ":corporateVehicleId/details",
    component: CorporateVehicleDetailsComponent,
    data: {pageTitle: "corporate vehicle details"},
    children: [
      {
        path: "main-info",
        component: VehicleMainInfo,
        data: {pageTitle: "Main Vehicle Info"},
      },
      {
        path: "vehicle-management",
        component: VehicleManagementComponent,
        data: {pageTitle: "Main Vehicle Info"},
      },
    ]
  },
  {
    path: "assign-daily-policy",
    component: VehicleDailyPolicyComponent,
    data: {pageTitle: "Vehicle Daily Policy"},
  },
  {
    path: "manual-mileage",
    component: VehicleManualMileageComponent,
    data: {pageTitle: "Vehicle Manual Mileage"},
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateVehicleRoutingModule {
}
