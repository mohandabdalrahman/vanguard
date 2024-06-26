import { NgModule } from "@angular/core";

import { PendingRequestsRoutingModule } from "./pending-requests-routing.module";
import { SharedModule } from "@shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PendingRequestsComponent } from "./pending-requests/pending-requests.component";
import { PendingRequestsHeaderComponent } from "./pending-requests-header/pending-requests-header.component";
import { NbAlertModule, NbDatepickerModule } from "@nebular/theme";
import { ListPendingRequestsComponent } from "./list-pending-requests/list-pending-requests.component";
import { PendingRequestsCardComponent } from "./pending-requests-card/pending-requests-card.component";
import { PendingRequestDetailsComponent } from "./pending-request-details/pending-request-details.component";

@NgModule({
  declarations: [
    PendingRequestsComponent,
    PendingRequestsHeaderComponent,
    ListPendingRequestsComponent,
    PendingRequestsCardComponent,
    PendingRequestDetailsComponent,
  ],
  imports: [
    SharedModule,
    PendingRequestsRoutingModule,
    NbDatepickerModule,
    NbAlertModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class PendingRequestsModule {}
