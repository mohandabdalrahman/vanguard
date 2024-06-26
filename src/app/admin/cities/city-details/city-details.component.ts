import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {Country} from "app/admin/countries/country.model";
import {CountryService} from "app/admin/countries/country.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CityService} from "../city.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-city-details",
  templateUrl: "./city-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./city-details.component.scss",
  ],
})
export class CityDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  city: any;
  countryId: number;
  cityId: number;
  currentLang: string;
  suspended : boolean;

  constructor(
    private route: ActivatedRoute,
    private cityService: CityService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
    this.city = {};
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.countryId = params["countryId"];
        this.cityId = params["cityId"];
      })
    );
    if (this.countryId && this.cityId) {
      this.showCityDetails();
    } else {

      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  showCityDetails() {
    
    this.subs.add(
      this.cityService.getCity(this.countryId, this.cityId).subscribe(
        (city) => {
          if (city) {
            const {countryId, suspended, ...other} = removeUnNeededProps(city);
            this.city = other;
            this.suspended = !suspended;
            this.getCountry();
          } else {
            this.translate.get(["error.noCityFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
            //this.toastr.warning("No city found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCountry() {
    if (this.countryId) {
      
      this.subs.add(
        this.countryService.getCountry(this.countryId).subscribe(
          (country: Country) => {
            if (country) {
              this.city["countryName"] = country.enName;
            } else {

              this.translate.get(["error.noCountryFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );


              //this.toastr.warning("No country found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      console.error("no country id provided");
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
