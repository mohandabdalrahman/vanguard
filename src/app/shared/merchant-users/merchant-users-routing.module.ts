import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from "app/guards/form.guard";
import { CreateMerchantUserComponent } from "./create-merchant-user/create-merchant-user.component";
import { ListMerchantUsersComponent } from "./list-merchant-users/list-merchant-users.component";
import { MerchantUserDetailsComponent } from "./merchant-user-details/merchant-user-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantUsersComponent,
    data: { pageTitle: "users" },
  },
  {
    path: "create",
    component: CreateMerchantUserComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create user" },
  },
  {
    path: ":merchantUserId/update",
    component: CreateMerchantUserComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update user", view: "update" },
  },
  {
    path: ":merchantUserId/details",
    component: MerchantUserDetailsComponent,
    data: { pageTitle: "user details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantUsersRoutingModule {}
