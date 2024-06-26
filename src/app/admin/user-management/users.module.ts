import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CreateUserComponent } from "./create-user/create-user.component";
import { ListUsersComponent } from "./list-users/list-users.component";
import { UserDetailsComponent } from "./user-details/user-details.component";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [ListUsersComponent, CreateUserComponent, UserDetailsComponent],
  imports: [
    UsersRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class UsersModule {}
