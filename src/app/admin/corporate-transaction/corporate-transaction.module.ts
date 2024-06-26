import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CorporateTransactionRoutingModule } from "./corporate-transaction-routing.module";
import { ListCorporateTransactionComponent } from "./list-corporate-transaction/list-corporate-transaction.component";
import { CorporateTransactionDetailsComponent } from './corporate-transaction-details/corporate-transaction-details.component';
import {NbCardModule} from "@nebular/theme";
import { CorporateTransactionReviewComponent } from "./corporate-transaction-review-details/corporate-transaction-review-details.component";
import { CorporateTransactionReportsComponent } from './corporate-transaction-reports/corporate-transaction-reports.component';

@NgModule({
  declarations: [ListCorporateTransactionComponent, CorporateTransactionDetailsComponent, CorporateTransactionReviewComponent, CorporateTransactionReportsComponent],
  imports: [
    SharedModule,
    NbCardModule,
    CorporateTransactionRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class CorporateTransactionModule {}
