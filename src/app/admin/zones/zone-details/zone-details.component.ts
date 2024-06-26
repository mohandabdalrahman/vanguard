import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {CityService} from "app/admin/cities/city.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {ZoneService} from "../zone.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-zone-details",
  templateUrl: "./zone-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./zone-details.component.scss",
  ],
})
export class ZoneDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  zone = {};
  countryId: number;
  cityId: number;
  zoneId: number;
  currentLang: string;
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    private zoneService: ZoneService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private cityService: CityService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.countryId = params["countryId"];
        this.cityId = params["cityId"];
        this.zoneId = params["zoneId"];
      })
    );
    if (this.countryId && this.cityId && this.zoneId) {
      this.showZoneDetails();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  showZoneDetails() {
    
    this.subs.add(
      this.zoneService
        .getZone(this.countryId, this.cityId, this.zoneId)
        .subscribe(
          (zone) => {
            if (zone) {
              const {cityId, suspended, ...other} = removeUnNeededProps(zone);
              this.zone = other;
              this.suspended = !suspended;
              this.getCity();
            } else {
              this.translate.get(["error.noZoneFound", "type.warning"]).subscribe(
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

  getCity() {
    if (this.countryId && this.cityId) {
      
      this.subs.add(
        this.cityService.getCity(this.countryId, this.cityId).subscribe(
          (city) => {
            if (city) {
              this.zone["cityName"] = city.enName;
            } else {
              this.translate.get(["error.noCityFound", "type.warning"]).subscribe(
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
    } else {
      console.error("no countryId or cityId provided");
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
