import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListCorporateAlertsComponent} from "./list-corporate-alerts/list-corporate-alerts.component";

const routes: Routes = [
  {
    path: '',
    component: ListCorporateAlertsComponent,
    data: {pageTitle: "corporate alerts"},
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateAlertRoutingModule {
}
