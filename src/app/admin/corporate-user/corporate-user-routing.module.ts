import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CorporateUserDetailsComponent } from "./corporate-user-details/corporate-user-details.component";
import { CreateCorporateUserComponent } from "./create-corporate-user/create-corporate-user.component";
import { ListCorporateUserComponent } from "./list-corporate-user/list-corporate-user.component";
import {SelectedOuNodeGuard} from "../../guards/selected-ouNode.guard";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateUserComponent,
    data: { pageTitle: "corporate user" },
  },
  {
    path: "create",
    component: CreateCorporateUserComponent,
    canDeactivate: [FormGuard],
    canActivate: [SelectedOuNodeGuard],
    data: { pageTitle: "add corporate" },
  },
  {
    path: ":corporateUserId/update",
    component: CreateCorporateUserComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate", view: "update" },
  },
  {
    path: ":corporateUserId/details",
    component: CorporateUserDetailsComponent,
    data: { pageTitle: "corporate user details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateUserRoutingModule {}
