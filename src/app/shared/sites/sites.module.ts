import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared.module";
import { CreateSiteComponent } from "./create-site/create-site.component";
import { ListSitesComponent } from "./list-sites/list-sites.component";
import { SiteDetailsComponent } from "./site-details/site-details.component";
import { SitesRoutingModule } from "./sites-routing.module";


@NgModule({
  declarations: [ListSitesComponent, SiteDetailsComponent, CreateSiteComponent],
  imports: [
    SitesRoutingModule,
    SharedModule,
    TranslateModule.forChild({ extend: true }),
  ],
})
export class SitesModule {}
