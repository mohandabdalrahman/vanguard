import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Country} from "../country.model";
import {CountryService} from "../country.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-country-details",
  templateUrl: "./country-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./country-details.component.scss",
  ],
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  country: any;
  countryId: number;
  currentLang: string
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    private countryService: CountryService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
    this.country = {};
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.countryId = params["countryId"];
      })
    );
    if (this.countryId) {
      this.showCountryDetails();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  showCountryDetails() {
    
    this.subs.add(
      this.countryService.getCountry(this.countryId).subscribe(
        (country: Country) => {
          if (country) {
            const { currency,suspended, ...other } = removeUnNeededProps(country);
            this.country = other;
            this.country["currencyEnName"] = currency.enName;
            this.country["currencyArName"] = currency.localeName;
            this.country["code"] = currency.code;
            this.suspended = !suspended;
          } else {
            this.translate.get(["error.noCountryFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
