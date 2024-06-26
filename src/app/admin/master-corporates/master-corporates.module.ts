import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { ListMasterCorporatesComponent } from "./list-master-corporates/list-master-corporates.component";
import { MasterCorporatesRoutingModule } from "./master-corporates-routing.module";
import { CreateMasterCorporateComponent } from "./create-master-corporate/create-master-corporate.component";

@NgModule({
  declarations: [ListMasterCorporatesComponent, CreateMasterCorporateComponent],
  imports: [
    SharedModule,
    MasterCorporatesRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MasterCorporatesModule {}
