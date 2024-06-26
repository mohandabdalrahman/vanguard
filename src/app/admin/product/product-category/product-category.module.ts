import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { CreateProductCategoryComponent } from "./create-product-category/create-product-category.component";
import { ListProductCategoryComponent } from "./list-product-category/list-product-category.component";
import { ProductCategoryDetailsComponent } from "./product-category-details/product-category-details.component";
import { ProductCategoryRoutingModule } from "./product-category-routing.module";

@NgModule({
  declarations: [
    ListProductCategoryComponent,
    CreateProductCategoryComponent,
    ProductCategoryDetailsComponent,
  ],
  imports: [
    ProductCategoryRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class ProductCategoryModule {}
