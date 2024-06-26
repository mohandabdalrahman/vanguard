import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {CorporateContainerRoutingModule} from "./corporate-container-routing.module";
import {ListCorporateContainersComponent} from './list-corporate-containers/list-corporate-containers.component';
import {CreateCorporateContainerComponent} from './create-corporate-container/create-corporate-container.component';
import {CorporateContainerDetailsComponent} from './corporate-container-details/corporate-container-details.component';
import {NbAutocompleteModule} from "@nebular/theme";


@NgModule({
  declarations: [
    ListCorporateContainersComponent,
    CreateCorporateContainerComponent,
    CorporateContainerDetailsComponent,
  ],
  imports: [
    SharedModule,
    CorporateContainerRoutingModule,
    TranslateModule.forChild({extend: true}),
    NbAutocompleteModule,
  ],
})
export class CorporateContainerModule {
}
