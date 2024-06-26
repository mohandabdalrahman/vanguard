import {HttpClient} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {forkJoin} from "rxjs";
import {map} from "rxjs/operators";

const TRANSLATION_FILES = [
  {
    prefix: "/assets/i18n",
    suffix: "product.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "user-roles.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "merchants.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "login.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "shared.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "country.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "city.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "zone.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "corporates.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "invoice.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "bill.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "report.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "sidebar.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "messages.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "transaction.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "tabs.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "dashboard.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "attachments.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "pending-requests.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "organizational-chart.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "context-menu.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "error-code.json",
  },
  {
    prefix: "/assets/i18n",
    suffix: "balance-transfer.json",
  },
];

interface Path {
  prefix: string;
  suffix: string;
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export class TranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    public resources: Path[] = TRANSLATION_FILES
  ) {
  }

  // https://Manex-dev-fb382b996773a66cd49ca06f5b5ccc93.s3.me-south-1.amazonaws.com/assets/i18n/en/corporates.json
  public getTranslation(lang: string): any {
    return forkJoin(
      this.resources.map(({prefix, suffix}) => {
        return this.http.get(`${prefix}/${lang}/${suffix}`);
      })
    ).pipe(
      map((response) => {
        return response.reduce((a, b) => {
          return {...a, ...b};
        });
      })
    );
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class TranslationModule {
}
