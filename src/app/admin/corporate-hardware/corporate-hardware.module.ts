import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {CorporateHardwareRoutingModule} from "./corporate-hardware-routing.module";
import {ListCorporateHardwaresComponent} from './list-corporate-hardwares/list-corporate-hardwares.component';
import {CreateCorporateHardwareComponent} from './create-corporate-hardware/create-corporate-hardware.component';
import {CorporateHardwareDetailsComponent} from './corporate-hardware-details/corporate-hardware-details.component';
import {NbAutocompleteModule, NbTagModule} from "@nebular/theme";

@NgModule({
  declarations: [
    ListCorporateHardwaresComponent,
    CreateCorporateHardwareComponent,
    CorporateHardwareDetailsComponent
  ],
  imports: [
    SharedModule,
    CorporateHardwareRoutingModule,
    TranslateModule.forChild({extend: true}),
    NbTagModule,
    NbAutocompleteModule,
  ],
})
export class CorporateHardwareModule {
}
