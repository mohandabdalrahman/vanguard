import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CreateUserRolesComponent } from "./create-user-roles/create-user-roles.component";
import { ListUserRolesComponent } from "./list-user-roles/list-user-roles.component";
import { UserRolesDetailsComponent } from "./user-roles-details/user-roles-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListUserRolesComponent,
    data: { pageTitle: "user roles" },
  },
  {
    path: "create",
    component: CreateUserRolesComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create user roles" },
  },
  {
    path: ":id/update",
    component: CreateUserRolesComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update user roles", view: "update" },
  },
  {
    path: ":id/details",
    component: UserRolesDetailsComponent,
    data: { pageTitle: "user roles details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRolesRoutingModule {}
