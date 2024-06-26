import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared.module";
import { ContactDetailsComponent } from "./contact-details/contact-details.component";
import { ContactsRoutingModule } from "./contacts-routing.module";
import { CreateContactComponent } from "./create-contact/create-contact.component";
import { ListContactsComponent } from "./list-contacts/list-contacts.component";

@NgModule({
  declarations: [
    ListContactsComponent,
    CreateContactComponent,
    ContactDetailsComponent,
  ],
  imports: [
    ContactsRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class ContactsModule {}
