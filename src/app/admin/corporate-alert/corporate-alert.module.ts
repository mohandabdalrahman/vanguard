import {NgModule} from '@angular/core';
import {CorporateAlertRoutingModule} from './corporate-alert-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListCorporateAlertsComponent} from './list-corporate-alerts/list-corporate-alerts.component';
import {NbAccordionModule} from "@nebular/theme";


@NgModule({
  declarations: [
    ListCorporateAlertsComponent
  ],
  imports: [
    SharedModule,
    CorporateAlertRoutingModule,
    TranslateModule.forChild({extend: true}),
    NbAccordionModule
  ]
})
export class CorporateAlertModule {
}
