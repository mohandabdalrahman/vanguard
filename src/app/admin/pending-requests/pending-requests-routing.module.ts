import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PendingRequestsComponent } from "./pending-requests/pending-requests.component";
import { SystemType } from "@models/system-type";
import { PendingRequestsResolver } from "./pending-requests.resolver";
import { ListPendingRequestsComponent } from "./list-pending-requests/list-pending-requests.component";
import { PendingRequestsTabs } from "./pending-requests-tabs.model";
import { PendingRequestDetailsComponent } from "./pending-request-details/pending-request-details.component";
import { SystemDataResolver } from "./system-data.resolver";

const routes: Routes = [
  {
    path: "merchants",
    component: PendingRequestsComponent,
    data: {systemType: SystemType.MERCHANT},
    resolve: {
      pendingRequests: PendingRequestsResolver,
      systemData: SystemDataResolver,
    },
    children: [
      {
        path: PendingRequestsTabs.PRODUCT.toLowerCase(),
        component: ListPendingRequestsComponent,
        data: {currentTab: PendingRequestsTabs.PRODUCT},
      },
      {
        path: PendingRequestsTabs.MERCHANT.toLowerCase(),
        component: ListPendingRequestsComponent,
        data: {currentTab: PendingRequestsTabs.MERCHANT},
      },
      {
        path: PendingRequestsTabs.ROLE.toLowerCase(),
        component: ListPendingRequestsComponent,
        data: {currentTab: PendingRequestsTabs.ROLE},
      },
    ],
  },
  {
    path: "corporates",
    component: PendingRequestsComponent,
    data: {systemType: SystemType.CORPORATE},
    resolve: {
      pendingRequests: PendingRequestsResolver,
      systemData: SystemDataResolver,
    },
  },
  {
    path: "admin",
    component: PendingRequestsComponent,
    data: {systemType: SystemType.ADMINISTRATION},
  },
  {
    path: "**",
    component: PendingRequestDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingRequestsRoutingModule {
}
