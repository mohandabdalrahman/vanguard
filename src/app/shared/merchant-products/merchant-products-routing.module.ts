import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FormGuard} from 'app/guards/form.guard';
import {CreateMerchantProductComponent} from "./create-merchant-product/create-merchant-product.component";
import {ListMerchantProductsComponent} from "./list-merchant-products/list-merchant-products.component";
import {MerchantProductDetailsComponent} from "./merchant-product-details/merchant-product-details.component";
// import {GlobalProductGuard} from "../../guards/global-product.guard";

const routes: Routes = [
  {
    path: "",
    component: ListMerchantProductsComponent,
    data: {pageTitle: "merchant products"},
  },
  {
    path: "create",
    component: CreateMerchantProductComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "create merchant product"},
  },
  {
    path: ":merchantProductId/update",
    component: CreateMerchantProductComponent,
    canDeactivate: [FormGuard],
    // canActivate: [GlobalProductGuard],
    data: {pageTitle: "update merchant product", view: "update"},
  },
  {
    path: ":merchantProductId/details",
    component: MerchantProductDetailsComponent,
    data: {pageTitle: "product details"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantProductsRoutingModule {
}
