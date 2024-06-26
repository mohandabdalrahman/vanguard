import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {NbAutocompleteModule} from "@nebular/theme";

import { CorporateCardHoldersRoutingModule } from './corporate-card-holders-routing.module';
import { CardHoldersListComponent } from './card-holders-list/card-holders-list.component';
import { UpdateCardHolderComponent } from './update-card-holder/update-card-holder.component';
import { CardHolderDetailComponent } from './card-holder-detail/card-holder-detail.component';
import { ListUnassignedUsersComponent } from './list-unassigned-users/list-unassigned-users.component';
import { VirtualCardHoldersListComponent } from './virtual-card-holders-list/virtual-card-holders-list.component';


@NgModule({
  declarations: [
    CardHoldersListComponent,
    UpdateCardHolderComponent,
    CardHolderDetailComponent,
    ListUnassignedUsersComponent,
    VirtualCardHoldersListComponent
  ],
  imports: [
    CommonModule,
    CorporateCardHoldersRoutingModule,
    SharedModule,
    TranslateModule.forChild({extend: true}),
    NbAutocompleteModule,
  ],providers: [
    DatePipe
  ]
})
export class CorporateCardHoldersModule { }
