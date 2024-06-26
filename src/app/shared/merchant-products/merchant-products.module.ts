import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared.module";
import { CreateMerchantProductComponent } from "./create-merchant-product/create-merchant-product.component";
import { ListMerchantProductsComponent } from "./list-merchant-products/list-merchant-products.component";
import { MerchantProductDetailsComponent } from "./merchant-product-details/merchant-product-details.component";
import { MerchantProductsRoutingModule } from "./merchant-products-routing.module";

@NgModule({
  declarations: [
    MerchantProductDetailsComponent,
    CreateMerchantProductComponent,
    ListMerchantProductsComponent,
  ],
  imports: [
    MerchantProductsRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class MerchantProductsModule {}
