import {NgModule} from '@angular/core';
import {CorporateBillsRoutingModule} from './corporate-bills-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {ListCorporateBillsComponent} from './list-corporate-bills/list-corporate-bills.component';
import { CorporateBillDetailsComponent } from './corporate-bill-details/corporate-bill-details.component';


@NgModule({
  declarations: [
    ListCorporateBillsComponent,
    CorporateBillDetailsComponent,
  ],
  imports: [
    SharedModule,
    CorporateBillsRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class CorporateBillsModule {
}
