import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CorporateHardwareDetailsComponent } from "./corporate-hardware-details/corporate-hardware-details.component";
import { CreateCorporateHardwareComponent } from "./create-corporate-hardware/create-corporate-hardware.component";
import { ListCorporateHardwaresComponent } from "./list-corporate-hardwares/list-corporate-hardwares.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateHardwaresComponent,
    data: { pageTitle: "corporate hardwares" },
  },
  {
    path: "create",
    component: CreateCorporateHardwareComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create corporate hardware" },
  },
  {
    path: ":corporateHardwareId/update",
    component: CreateCorporateHardwareComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate hardware", view: "update" },
  },
  {
    path: ":corporateHardwareId/details",
    component: CorporateHardwareDetailsComponent,
    data: { pageTitle: "corporate hardware details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateHardwareRoutingModule {}
