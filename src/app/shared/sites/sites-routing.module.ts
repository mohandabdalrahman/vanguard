import {NgModule} from "@angular/core";
import {ExtraOptions, RouterModule, Routes} from "@angular/router";
import {CreateSiteComponent} from "./create-site/create-site.component";
import {ListSitesComponent} from "./list-sites/list-sites.component";
import {SiteDetailsComponent} from "./site-details/site-details.component";
import {FormGuard} from "../../guards/form.guard";


export const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: 'always'
};


const routes: Routes = [
  {
    path: "",
    component: ListSitesComponent,
    data: { pageTitle: "sites" },
  },
  {
    path: "create",
    component: CreateSiteComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "create site" },
  },
  {
    path: ":siteId/update",
    component: CreateSiteComponent,
    canDeactivate: [FormGuard],
    data: { pageTitle: "update site", view: "update" },
  },
  {
    path: ":siteId/details",
    component: SiteDetailsComponent,
    data: { pageTitle: "site details" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesRoutingModule {}
