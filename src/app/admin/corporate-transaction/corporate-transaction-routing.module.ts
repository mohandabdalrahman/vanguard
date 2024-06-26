import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ListCorporateTransactionComponent} from "./list-corporate-transaction/list-corporate-transaction.component";
import {
  CorporateTransactionDetailsComponent
} from "./corporate-transaction-details/corporate-transaction-details.component";
import { CorporateTransactionReviewComponent } from "./corporate-transaction-review-details/corporate-transaction-review-details.component";
import { CorporateTransactionReportsComponent } from "./corporate-transaction-reports/corporate-transaction-reports.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateTransactionComponent,
    data: {pageTitle: "corporate transactions"},
  },
  {
    path: ":transactionId/details",
    component: CorporateTransactionDetailsComponent,
    data: {pageTitle: "corporate transaction details"},
  },
  {
    path: "corporate-transactions-review",
    component: CorporateTransactionReviewComponent,
    data: { pageTitle: "admin transactions review" },
  },
  {
    path: "transactions-reports",
    component: CorporateTransactionReportsComponent,
    data: { pageTitle: "corporate transactions reports" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateTransactionRoutingModule {
}
