import {NgModule} from "@angular/core";
import {NbMenuModule} from "@nebular/theme";
import {ThemeModule} from "../@theme/theme.module";
import {MiscellaneousModule} from "../common/miscellaneous/miscellaneous.module";
import {HttpLoaderFactory} from "../common/translation/translation.module";
import {AdminRoutingModule} from "./admin-routing.module";
import {AdminComponent} from "./admin.component";
import {AdminHomeComponent} from "./home/admin-home.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";

@NgModule({
  imports: [
    AdminRoutingModule,
    MiscellaneousModule,
    ThemeModule,
    NbMenuModule,
    TranslateModule.forChild({
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [AdminComponent, AdminHomeComponent, ],
})
export class AdminModule {}
