import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { FileUploadModule } from "ng2-file-upload";
import { AddCorporateComponent } from "./add-corporate/add-corporate.component";
import { CorporateDetailsComponent } from "./corporate-details/corporate-details.component";
import { CorporatesRoutingModule } from "./corporates-routing.module";
import { ListCorporatesComponent } from "./list-corporates/list-corporates.component";

@NgModule({
  declarations: [
    ListCorporatesComponent,
    AddCorporateComponent,
    CorporateDetailsComponent,
  ],
  imports: [
    SharedModule,
    CorporatesRoutingModule,
    FileUploadModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class CorporatesModule {}
