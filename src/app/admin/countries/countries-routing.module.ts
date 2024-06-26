import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddCountryComponent } from "./add-country/add-country.component";
import { CountryDetailsComponent } from "./country-details/country-details.component";
import {FormGuard} from "../../guards/form.guard";
import {ListCountriesComponent} from "./list-countries/list-countries.component";

const routes: Routes = [
  {
    path: "",
    component: ListCountriesComponent,
    data: { pageTitle: "countries" },
  },
  {
    path: "create",
    component: AddCountryComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "add country" },
  },
  {
    path: ":countryId/update",
    component: AddCountryComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update country", view: "update" },
  },
  {
    path: ":countryId/details",
    component: CountryDetailsComponent,
    data: { pageTitle: "country details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CountriesRoutingModule {}
