import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { AddCityComponent } from "./add-city/add-city.component";
import { CitiesRoutingModule } from "./cities-routing.module";
import { CityDetailsComponent } from "./city-details/city-details.component";
import { ListCitiesComponent } from "./list-cities/list-cities.component";

@NgModule({
  declarations: [ListCitiesComponent, AddCityComponent, CityDetailsComponent],
  imports: [
    CitiesRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class CitiesModule {}
