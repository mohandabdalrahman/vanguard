import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared.module";
import { AttachmentsRoutingModule } from "./attachments-routing.module";

@NgModule({
  declarations: [
    
  ],
  imports: [
    AttachmentsRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
  
})
export class AttachmentsModule {}
