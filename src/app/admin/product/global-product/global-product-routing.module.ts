import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FormGuard} from 'app/guards/form.guard';
import {CreateGlobalProductComponent} from "./create-global-product/create-global-product.component";
import {GlobalProductDetailsComponent} from "./global-product-details/global-product-details.component";
import {ListGlobalProductComponent} from "./list-global-product/list-global-product.component";

const routes: Routes = [
  {
    path: "",
    component: ListGlobalProductComponent,
    data: {pageTitle: "global product"},
  },
  {
    path: "create",
    component: CreateGlobalProductComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "create global product"},
  },
  {
    path: ":globalProductId/update",
    component: CreateGlobalProductComponent,
    canDeactivate: [FormGuard],
    data: {pageTitle: "update global product", view: "update"},
  },
  {
    path: ":globalProductId/details",
    component: GlobalProductDetailsComponent,
    data: {pageTitle: "global product details"},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GlobalProductRoutingModule {
}
