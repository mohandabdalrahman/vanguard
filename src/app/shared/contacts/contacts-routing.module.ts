import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { ContactDetailsComponent } from "./contact-details/contact-details.component";
import { CreateContactComponent } from "./create-contact/create-contact.component";
import { ListContactsComponent } from "./list-contacts/list-contacts.component";

const routes: Routes = [
  {
    path: "",
    component: ListContactsComponent,
    data: { pageTitle: "Contacts" },
  },
  {
    path: "create",
    component: CreateContactComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "Create Contact" },
  },
  {
    path: ":contactId/update",
    component: CreateContactComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "Update Contact", view: "update" },
  },
  {
    path: ":contactId/details",
    component: ContactDetailsComponent,
    data: { pageTitle: "Contact Details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsRoutingModule {}
