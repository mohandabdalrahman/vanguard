import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListCorporateBillsComponent } from "./list-corporate-bills/list-corporate-bills.component";
import { CorporateBillDetailsComponent } from "./corporate-bill-details/corporate-bill-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateBillsComponent,
    data: { pageTitle: "Corporate Bills" },
  },
  {
    path: ":billId/userTypeId/:userTypeId/details",
    component: CorporateBillDetailsComponent,
    data: { pageTitle: "Corporate Bill details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateBillsRoutingModule {}
