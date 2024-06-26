import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from "app/guards/form.guard";
import { AddCityComponent } from "./add-city/add-city.component";
import { CityDetailsComponent } from "./city-details/city-details.component";
import { ListCitiesComponent } from "./list-cities/list-cities.component";

const routes: Routes = [
  {
    path: "",
    component: ListCitiesComponent,
    data: { pageTitle: "cities" },
  },
  {
    path: "create",
    component: AddCityComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "add city" },
  },
  {
    path: ":cityId/update",
    component: AddCityComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update city", view: "update" },
  },
  {
    path: ":cityId/details",
    component: CityDetailsComponent,
    data: { pageTitle: "city details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitiesRoutingModule {}
