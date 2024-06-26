import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from "app/guards/form.guard";
import { CreateMasterCorporateComponent } from "./create-master-corporate/create-master-corporate.component";
import { ListMasterCorporatesComponent } from "./list-master-corporates/list-master-corporates.component";
import { MasterCorporateDetailsComponent } from "@shared/master-corporate-details/master-corporate-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListMasterCorporatesComponent,
    data: { pageTitle: "master corporates" },
  },
  {
    path: "create",
    component: CreateMasterCorporateComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create master corporate" },
  },
  {
    path: ":masterCorporateId/update",
    component: CreateMasterCorporateComponent,
    data: { pageTitle: "update master corporate", view: "update" },
  },
  {
    path: ":masterCorporateId/details",
    component: MasterCorporateDetailsComponent,
    data: { pageTitle: "master corporate details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterCorporatesRoutingModule {}
