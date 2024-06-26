import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RequestPasswordComponent } from "./request-password/request-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";

const routes: Routes = [
  {
    path: "",
    component: LoginComponent,
    data: { pageTitle: "login" },
  },
  {
    path: "request-password",
    component: RequestPasswordComponent,
    data: { pageTitle: "request password" },
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    data: { pageTitle: "reset password" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
