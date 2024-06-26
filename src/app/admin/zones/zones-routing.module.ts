import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { AddZoneComponent } from "./add-zone/add-zone.component";
import { ListZonesComponent } from "./list-zones/list-zones.component";
import { ZoneDetailsComponent } from "./zone-details/zone-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListZonesComponent,
    data: { pageTitle: "zones" },
  },
  {
    path: "create",
    component: AddZoneComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "Add zone" },
  },
  {
    path: ":zoneId/update",
    component: AddZoneComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update zone", view: "update" },
  },
  {
    path: ":zoneId/details",
    component: ZoneDetailsComponent,
    data: { pageTitle: "zone details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZonesRoutingModule {}
