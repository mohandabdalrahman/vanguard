import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from "app/guards/form.guard";
import { CardHolderDetailComponent } from "./card-holder-detail/card-holder-detail.component";
import { CardHoldersListComponent } from "./card-holders-list/card-holders-list.component";
import { ListUnassignedUsersComponent } from './list-unassigned-users/list-unassigned-users.component';
import { UpdateCardHolderComponent } from "./update-card-holder/update-card-holder.component";
import { VirtualCardHoldersListComponent } from "./virtual-card-holders-list/virtual-card-holders-list.component";
const routes: Routes = [
  {
    path: "",
    component: CardHoldersListComponent,
    data: { pageTitle: "corporate card holders" },
  },
  {
    path: ":cardHolderId/update",
    component: UpdateCardHolderComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate card holder", view: "update" },
  },
  {
    path: ":cardHolderId/details",
    component: CardHolderDetailComponent,
    data: { pageTitle: "corporate container details" },
  },
  {
    path: "add",
    component: ListUnassignedUsersComponent,
    data: { pageTitle: "Available Users" },
  },
  {
    path: "print",
    component: VirtualCardHoldersListComponent,
    data: { pageTitle: "Gauge Cardholders" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateCardHoldersRoutingModule {}
