import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CreateProductCategoryComponent } from "./create-product-category/create-product-category.component";
import { ListProductCategoryComponent } from "./list-product-category/list-product-category.component";
import { ProductCategoryDetailsComponent } from "./product-category-details/product-category-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListProductCategoryComponent,
    data: { pageTitle: "product category" },
  },
  {
    path: "create",
    component: CreateProductCategoryComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create product category" },
  },
  {
    path: ":productId/update",
    component: CreateProductCategoryComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update product category", view: "update" },
  },
  {
    path: ":productId/details",
    component: ProductCategoryDetailsComponent,
    data: { pageTitle: "product category details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductCategoryRoutingModule {}
