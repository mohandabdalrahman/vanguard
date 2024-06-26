import {NgModule} from "@angular/core";
import {MerchantRoutingModule} from "./merchant-routing.module";
import {HomeComponent} from "./home/home.component";
import {MiscellaneousModule} from "../common/miscellaneous/miscellaneous.module";
import {MerchantComponent} from "./merchant.component";
import {SharedModule} from "@shared/shared.module";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpLoaderFactory} from "../common/translation/translation.module";
import {HttpClient} from "@angular/common/http";
import {NgxChartsModule} from "@swimlane/ngx-charts";

@NgModule({
  declarations: [MerchantComponent, HomeComponent],
  imports: [
    MerchantRoutingModule,
    MiscellaneousModule,
    SharedModule,
    NgxChartsModule,
    TranslateModule.forChild({
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class MerchantModule {
}
