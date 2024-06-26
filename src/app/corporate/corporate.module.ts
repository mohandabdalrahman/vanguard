import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ThemeModule} from "../@theme/theme.module";
import {NbCardModule, NbMenuModule} from "@nebular/theme";
import {CorporateComponent} from "./corporate.component";
import {CorporateRoutingModule} from "./corporate-routing.module";
import {HttpLoaderFactory} from "../common/translation/translation.module";
import {MiscellaneousModule} from "../common/miscellaneous/miscellaneous.module";
import {HomeComponent} from "./home/home.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {DashboardTableComponent} from './home/dashboard-table/dashboard-table.component';
import {SharedModule} from "@shared/shared.module";

@NgModule({
  declarations: [CorporateComponent, HomeComponent, DashboardTableComponent],
    imports: [
        CommonModule,
        CorporateRoutingModule,
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
export class CorporateModule {
}
