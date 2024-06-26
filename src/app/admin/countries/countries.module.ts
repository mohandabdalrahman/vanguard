import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { AddCountryComponent } from "./add-country/add-country.component";
import { CountriesRoutingModule } from "./countries-routing.module";
import { CountryDetailsComponent } from "./country-details/country-details.component";
import { ListCountriesComponent } from "./list-countries/list-countries.component";

@NgModule({
  declarations: [
    ListCountriesComponent,
    AddCountryComponent,
    CountryDetailsComponent,
  ],
  imports: [
    CountriesRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class CountriesModule {}
