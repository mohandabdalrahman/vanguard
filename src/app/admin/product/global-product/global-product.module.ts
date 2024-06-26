import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CreateGlobalProductComponent } from "./create-global-product/create-global-product.component";
import { GlobalProductDetailsComponent } from "./global-product-details/global-product-details.component";
import { GlobalProductRoutingModule } from "./global-product-routing.module";
import { ListGlobalProductComponent } from "./list-global-product/list-global-product.component";

@NgModule({
  declarations: [
    ListGlobalProductComponent,
    CreateGlobalProductComponent,
    GlobalProductDetailsComponent,
  ],
  imports: [
    GlobalProductRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class GlobalProductModule {}
