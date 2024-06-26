import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CorporateContainerDetailsComponent } from "./corporate-container-details/corporate-container-details.component";
import { CreateCorporateContainerComponent } from "./create-corporate-container/create-corporate-container.component";
import { ListCorporateContainersComponent } from "./list-corporate-containers/list-corporate-containers.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateContainersComponent,
    data: { pageTitle: "corporate containers" },
  },
  {
    path: "create",
    component: CreateCorporateContainerComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create corporate container" },
  },
  {
    path: ":corporateContainerId/update",
    component: CreateCorporateContainerComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate container", view: "update" },
  },
  {
    path: ":corporateContainerId/details",
    component: CorporateContainerDetailsComponent,
    data: { pageTitle: "corporate container details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateContainerRoutingModule {}
