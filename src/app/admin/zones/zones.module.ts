import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { AddZoneComponent } from "./add-zone/add-zone.component";
import { ListZonesComponent } from "./list-zones/list-zones.component";
import { ZoneDetailsComponent } from "./zone-details/zone-details.component";
import { ZonesRoutingModule } from "./zones-routing.module";

@NgModule({
  declarations: [ListZonesComponent, AddZoneComponent, ZoneDetailsComponent],
  imports: [
    ZonesRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class ZonesModule {}
