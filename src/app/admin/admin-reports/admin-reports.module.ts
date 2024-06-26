import {NgModule} from '@angular/core';
import {AdminReportsRoutingModule} from './admin-reports-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {CorporateSalesComponent} from './corporate-sales/corporate-sales.component';
import {NbListModule} from "@nebular/theme";


@NgModule({
  declarations: [
    CorporateSalesComponent
  ],
  imports: [
    SharedModule,
    AdminReportsRoutingModule,
    NbListModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class AdminReportsModule { }
