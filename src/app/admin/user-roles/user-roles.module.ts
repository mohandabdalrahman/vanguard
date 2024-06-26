import { NgModule } from "@angular/core";
import { NbInputModule } from "@nebular/theme";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from '../../shared/shared.module';
import { CreateUserRolesComponent } from "./create-user-roles/create-user-roles.component";
import { ListUserRolesComponent } from "./list-user-roles/list-user-roles.component";
import { UserRolesDetailsComponent } from "./user-roles-details/user-roles-details.component";
import { UserRolesRoutingModule } from "./user-roles-routing.module";


@NgModule({
  declarations: [
    ListUserRolesComponent,
    CreateUserRolesComponent,
    UserRolesDetailsComponent,
  ],
  imports: [
    UserRolesRoutingModule,
    NbInputModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class UserRolesModule {}
