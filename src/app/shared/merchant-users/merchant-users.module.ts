import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared.module";
import { CreateMerchantUserComponent } from "./create-merchant-user/create-merchant-user.component";
import { ListMerchantUsersComponent } from "./list-merchant-users/list-merchant-users.component";
import { MerchantUserDetailsComponent } from "./merchant-user-details/merchant-user-details.component";
import { MerchantUsersRoutingModule } from "./merchant-users-routing.module";


@NgModule({
  declarations: [
    ListMerchantUsersComponent,
    CreateMerchantUserComponent,
    MerchantUserDetailsComponent,
  ],
  imports: [
    MerchantUsersRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MerchantUsersModule {}
