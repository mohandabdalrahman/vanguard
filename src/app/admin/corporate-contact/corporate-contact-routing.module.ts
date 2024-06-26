import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CorporateContactDetailsComponent } from "./corporate-contact-details/corporate-contact-details.component";
import { CreateCorporateContactComponent } from "./create-corporate-contact/create-corporate-contact.component";
import { ListCorporateContactComponent } from "./list-corporate-contact/list-corporate-contact.component";

const routes: Routes = [
  {
    path: "",
    component: ListCorporateContactComponent,
    data: { pageTitle: "corporate contact" },
  },
  {
    path: "create",
    component: CreateCorporateContactComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create corporate contact" },
  },
  {
    path: ":corporateContactId/update",
    component: CreateCorporateContactComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update corporate contact", view: "update" },
  },
  {
    path: ":corporateContactId/details",
    component: CorporateContactDetailsComponent,
    data: { pageTitle: "corporate details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateContactRoutingModule {}
