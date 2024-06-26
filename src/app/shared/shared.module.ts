import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import {
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbMenuModule,
  NbPopoverModule, NbRadioModule,
  NbToggleModule,
} from "@nebular/theme";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TranslateModule} from "@ngx-translate/core";
import {InvoiceComponent} from "@shared/invoice/invoice.component";
import {ThemeModule} from "@theme/theme.module";
import { AttachmentComponent } from "./attachment/attachment.component";
import {FileUploadModule} from "ng2-file-upload";
import {TotalSalesComponent} from "@shared/total-sales/total-sales.component";
import {TotalTxnAmountComponent} from "@shared/total-txn-amount/total-txn-amount.component";
import {ListSalesComponent} from "@shared/list-sales/list-sales.component";
import {RouterModule} from "@angular/router";
import {ListMerchantReportsComponent} from "@shared/list-merchant-reports/list-merchant-reports.component";
import { MasterCorporateDetailsComponent } from "@shared/master-corporate-details/master-corporate-details.component";
import { PolicySearchPipe } from "@theme/pipes/PolicyPipe/policy-search.pipe";
import { CreateManualReviewComponent } from './create-manual-review/create-manual-review.component';
import { ListAttachmentsComponent } from "./attachments/list-attachments/list-attachments.component";

@NgModule({
  declarations: [
    InvoiceComponent,
    AttachmentComponent,
    TotalSalesComponent,
    TotalTxnAmountComponent,
    ListSalesComponent,
    ListMerchantReportsComponent,
    MasterCorporateDetailsComponent,
    CreateManualReviewComponent,
    PolicySearchPipe,
    ListAttachmentsComponent
  ],
  imports: [
    ThemeModule,
    NbEvaIconsModule,
    NbIconModule,
    NbToggleModule,
    NbPopoverModule,
    NbMenuModule,
    NgbModule,
    TranslateModule.forChild({extend: true}),
    FormsModule,
    NbCheckboxModule,
    FileUploadModule,
    NbCardModule,
    RouterModule,
    NbRadioModule,
  ],
  exports: [
    ThemeModule,
    FormsModule,
    NbEvaIconsModule,
    NbIconModule,
    NbToggleModule,
    NbPopoverModule,
    NbCheckboxModule,
    NbMenuModule,
    NgbModule,
    InvoiceComponent,
    FileUploadModule,
    AttachmentComponent,
    TotalSalesComponent,
    MasterCorporateDetailsComponent,
    CreateManualReviewComponent,
    ListAttachmentsComponent,
    NbCardModule,
    PolicySearchPipe
  ],
})
export class SharedModule {}
