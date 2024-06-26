import { NgModule } from "@angular/core";
import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { UserTypeGuard } from "./guards/user-type.guard";

export const routes: Routes = [
  {
    path: "admin",
    canActivate: [AuthGuard],
    canLoad: [UserTypeGuard],
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
  },
  {
    path: "merchant",
    canActivate: [AuthGuard],
    canLoad: [UserTypeGuard],
    loadChildren: () =>
      import("./merchant/merchant.module").then((m) => m.MerchantModule),
  },
  {
    path: "corporate",
    canActivate: [AuthGuard],
    canLoad: [UserTypeGuard],
    loadChildren: () =>
      import("./corporate/corporate.module").then((m) => m.CorporateModule),
  },
  {
    path: "master_corporate",
    canActivate: [AuthGuard],
    canLoad: [UserTypeGuard],
    loadChildren: () =>
      import("./master-corporate/master-corporate.module").then(
        (m) => m.MasterCorporateModule
      ),
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },

  { path: "", redirectTo: "corporate", pathMatch: "full" },
  { path: "**", redirectTo: "auth" },
];

const config: ExtraOptions = {
  useHash: false,
  // preloadingStrategy: PreloadAllModules,
  paramsInheritanceStrategy: "always",
  onSameUrlNavigation: "reload",
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
