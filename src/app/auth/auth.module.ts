import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {AuthRoutingModule} from "./auth-routing.module";
import {AuthService} from "./auth.service";
import {LoginComponent} from "./login/login.component";
import {RequestPasswordComponent} from "./request-password/request-password.component";
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {NbAlertModule} from "@nebular/theme";

@NgModule({
  declarations: [
    LoginComponent,
    RequestPasswordComponent,
    ResetPasswordComponent
    ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    NbAlertModule,
    TranslateModule.forChild({ extend: true }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
