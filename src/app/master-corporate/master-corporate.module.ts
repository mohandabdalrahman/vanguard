import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MasterCorporateRoutingModule } from "./master-corporate-routing.module";
import { MasterCorporateComponent } from "./master-corporate.component";
import { MiscellaneousModule } from "../common/miscellaneous/miscellaneous.module";
import { ThemeModule } from "@theme/theme.module";
import { NbCardModule, NbMenuModule } from "@nebular/theme";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpLoaderFactory } from "../common/translation/translation.module";
import { HttpClient } from "@angular/common/http";
import { SharedModule } from "@shared/shared.module";
import { HomeComponent } from "./home/home.component";

@NgModule({
  declarations: [MasterCorporateComponent, HomeComponent],
  imports: [
    CommonModule,
    MasterCorporateRoutingModule,
    MiscellaneousModule,
    ThemeModule,
    NbMenuModule,
    NgxChartsModule,
    NbCardModule,
    TranslateModule.forChild({
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    SharedModule,
  ],
})
export class MasterCorporateModule {}
