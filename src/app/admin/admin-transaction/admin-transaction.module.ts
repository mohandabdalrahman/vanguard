import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { AdminTransactionRoutingModule } from "./admin-transaction-routing.module";
import { ListAdminTransactionComponent } from './list-admin-transaction/list-admin-transaction.component';
import { AdminTransactionReviewComponent } from './admin-transaction-review/admin-transaction-review.component';
import { AdminTransactionReportsComponent } from './admin-transaction-reports/admin-transaction-reports.component';
import { AdminTransactionReviewStatusComponent } from './admin-transaction-review-status/admin-transaction-review-status.component';

@NgModule({
  declarations: [
    ListAdminTransactionComponent,
    AdminTransactionReviewComponent,
    AdminTransactionReportsComponent,
    AdminTransactionReviewStatusComponent
  ],
  imports: [
    SharedModule,
    AdminTransactionRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class AdminTransactionModule {}
