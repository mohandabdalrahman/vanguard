import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormGuard } from 'app/guards/form.guard';
import { CreateMasterMerchantComponent } from "./create-master-merchant/create-master-merchant.component";
import { ListMasterMerchantsComponent } from "./list-master-merchants/list-master-merchants.component";
import { MasterMerchantDetailsComponent } from "./master-merchant-details/master-merchant-details.component";

const routes: Routes = [
  {
    path: "",
    component: ListMasterMerchantsComponent,
    data: { pageTitle: "Master Merchants" },
  },
  {
    path: "create",
    component: CreateMasterMerchantComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "Create Master Merchants" },
  },
  {
    path: ":masterMerchantId/update",
    component: CreateMasterMerchantComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "Update Master Merchants", view: "update" },
  },
  {
    path: ":masterMerchantId/details",
    component: MasterMerchantDetailsComponent,
    data: { pageTitle: "Master Merchants Details " },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterMerchantsRoutingModule {}
