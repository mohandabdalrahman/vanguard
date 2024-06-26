import { NgModule } from "@angular/core";
import {NbCheckboxModule, NbRadioModule, NbStepperModule} from "@nebular/theme";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CorporatePolicyRoutingModule } from "./corporate-policy-routing.module";
import { CreateCorporatePolicyComponent } from "./create-corporate-policy/create-corporate-policy.component";
import { ListCorporatePoliciesComponent } from "./list-corporate-policies/list-corporate-policies.component";
import { CorporatePolicyDetailsComponent } from './corporate-policy-details/corporate-policy-details.component';
import { UpdateCorporatePolicyComponent } from './update-corporate-policy/update-corporate-policy.component';

@NgModule({
  declarations: [
    ListCorporatePoliciesComponent,
    CreateCorporatePolicyComponent,
    CorporatePolicyDetailsComponent,
    UpdateCorporatePolicyComponent,
  ],
    imports: [
        SharedModule,
        CorporatePolicyRoutingModule,
        TranslateModule.forChild({extend: true}),
        NbRadioModule,
        NbCheckboxModule,
        NbStepperModule,
        ],
  })
    export class CorporatePolicyModule {}
