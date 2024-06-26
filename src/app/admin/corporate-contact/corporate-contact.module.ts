import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CorporateContactDetailsComponent } from "./corporate-contact-details/corporate-contact-details.component";
import { CorporateContactRoutingModule } from "./corporate-contact-routing.module";
import { CreateCorporateContactComponent } from "./create-corporate-contact/create-corporate-contact.component";
import { ListCorporateContactComponent } from "./list-corporate-contact/list-corporate-contact.component";

@NgModule({
  declarations: [
    ListCorporateContactComponent,
    CreateCorporateContactComponent,
    CorporateContactDetailsComponent,
  ],
  imports: [
    SharedModule,
    CorporateContactRoutingModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class CorporateContactModule {}
