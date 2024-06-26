import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {CorporateUserDetailsComponent} from "./corporate-user-details/corporate-user-details.component";
import {CorporateUserRoutingModule} from "./corporate-user-routing.module";
import {CreateCorporateUserComponent} from "./create-corporate-user/create-corporate-user.component";
import {ListCorporateUserComponent} from "./list-corporate-user/list-corporate-user.component";
import {NbRadioModule, NbStepperModule, NbTagModule} from "@nebular/theme";

@NgModule({
  declarations: [
    ListCorporateUserComponent,
    CreateCorporateUserComponent,
    CorporateUserDetailsComponent,
  ],
    imports: [
        SharedModule,
        CorporateUserRoutingModule,
        TranslateModule.forChild({extend: true}),
        NbRadioModule,
        NbStepperModule,
        NbTagModule,
    ],
  exports: [
    CreateCorporateUserComponent,
  ]
})
export class CorporateUserModule {
}
