import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  ApmErrorHandler,
  ApmModule,
  ApmService,
} from "@elastic/apm-rum-angular";
import { environment } from "@environments/environment";
import {
  NbDatepickerModule,
  NbMenuModule,
  NbSidebarModule,
} from "@nebular/theme";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { ThemeModule } from "@theme/theme.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TranslationModule } from "./common/translation/translation.module";
import { JwtInterceptor } from "@helpers/jwt.interceptor";
import { CssFileService } from "@services/css-file/css-file.service";
import { PagesMenuService } from "@services/pages-menu/pages-menu.service";
import { FormsModule } from "@angular/forms";
import { SpinnerInterceptor } from "@shared/interceptors/spinner.interceptor";

@NgModule({
  declarations: [AppComponent],
  imports: [
    ApmModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    ThemeModule.forRoot(),
    NbDatepickerModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
    }),
    NgbModule,
    TranslationModule,
  ],

  providers: [
    CssFileService,
    ApmService,
    {
      provide: ErrorHandler,
      useClass: ApmErrorHandler,
    },
    PagesMenuService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(service: ApmService) {
    // Agent API is exposed through this apm instance
    service.init({
      serviceName: "vanguard",
      environment: environment.production ? "liv" : "dev",
      serverUrl:
        "https://3b99b6e0901c41fcaae5a4f135df2683.apm.me-south-1.aws.elastic-cloud.com:443",
      distributedTracingOrigins: [`${environment.baseUrl}`],
      pageLoadTraceId: "${transaction.traceId}",
      pageLoadSpanId: "${transaction.ensureParentId()}",
    });

    // apm.setUserContext({
    //   'id': authService.getDecodeAccessToken(sessionStorage.getItem("token")).userCredentialId,
    //   'username': sessionStorage.getItem("userName")
    // })
  }
}
