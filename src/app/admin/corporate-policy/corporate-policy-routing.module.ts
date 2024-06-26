import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CorporatePolicyDetailsComponent } from "./corporate-policy-details/corporate-policy-details.component";
import { CreateCorporatePolicyComponent } from "./create-corporate-policy/create-corporate-policy.component";
import { ListCorporatePoliciesComponent } from "./list-corporate-policies/list-corporate-policies.component";
import { UpdateCorporatePolicyComponent } from "./update-corporate-policy/update-corporate-policy.component";
import {SelectedOuNodeGuard} from "../../guards/selected-ouNode.guard";

const routes: Routes = [
  {
    path: "",
    component: ListCorporatePoliciesComponent,
    data: { pageTitle: "corporate policies" },
  },
  {
    path: "create",
    component: CreateCorporatePolicyComponent,
    canDeactivate: [FormGuard],
    canActivate: [SelectedOuNodeGuard],
    data: { pageTitle: "create corporate policy" },
  },
  {
    path: ":corporatePolicyId/update",
    component: UpdateCorporatePolicyComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate policy" },
  },
  {
    path: ":corporatePolicyId/details",
    component: CorporatePolicyDetailsComponent,
    data: { pageTitle: "corporate policy details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporatePolicyRoutingModule {}
