import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CorporateTransactionDetailsComponent } from '../corporate-transaction/corporate-transaction-details/corporate-transaction-details.component';
import { ListAdminTransactionComponent } from "./list-admin-transaction/list-admin-transaction.component";
import { AdminTransactionReviewComponent } from "./admin-transaction-review/admin-transaction-review.component";
import { AdminTransactionReportsComponent } from "./admin-transaction-reports/admin-transaction-reports.component";
import { AdminTransactionReviewStatusComponent } from "./admin-transaction-review-status/admin-transaction-review-status.component";

const routes: Routes = [
  {
    path: "",
    component: ListAdminTransactionComponent,
    data: { pageTitle: "admin transactions" },
  },
  {
    path: ":transactionId/details",
    component: CorporateTransactionDetailsComponent,
    data: { pageTitle: "admin transaction details" },
  },
  {
    path: "transactions-review",
    component: AdminTransactionReviewComponent,
    data: { pageTitle: "admin transactions review" },
  },
  {
    path: "transactions-reports",
    component: AdminTransactionReportsComponent,
    data: { pageTitle: "admin transactions reports" },
  },
  {
    path: "transactions-reports/transactions-review-status",
    component: AdminTransactionReviewStatusComponent,
    data: { pageTitle: "admin transactions review status" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTransactionRoutingModule {}
