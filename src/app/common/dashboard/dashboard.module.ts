import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule, NbIconModule, NbListModule, NbRadioModule,
  NbSelectModule, NbTabsetModule,
  NbUserModule
} from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';



@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
  ],
  declarations: [

  ],
})
export class DashboardModule { }
