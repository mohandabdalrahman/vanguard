import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { ChangePasswordComponent} from './change-password/change-password.component';
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../../shared/shared.module";
@NgModule({
  declarations: [ 
    ChangePasswordComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild({ extend: true }),
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
