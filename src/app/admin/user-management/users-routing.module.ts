import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CreateUserComponent } from "./create-user/create-user.component";
import { ListUsersComponent } from "./list-users/list-users.component";
import { UserDetailsComponent } from "./user-details/user-details.component";

const routes: Routes = [
  { path: "", component: ListUsersComponent, data: { pageTitle: "users" } },
  {
    path: "create",
    component: CreateUserComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create user" },
  },
  {
    path: ":adminUserId/update",
    canDeactivate: [FormGuard],
    component: CreateUserComponent,
    data: { pageTitle: "update user", view: "update" },
  },
  {
    path: ":adminUserId/details",
    component: UserDetailsComponent,
    data: { pageTitle: "user details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
