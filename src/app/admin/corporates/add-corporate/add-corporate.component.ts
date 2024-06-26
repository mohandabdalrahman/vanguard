import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { FileUploader } from "ng2-file-upload";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { AuthService } from "../../../auth/auth.service";
import { City } from "../../cities/city.model";
import { CityService } from "../../cities/city.service";
import { Country } from "../../countries/country.model";
import { CountryService } from "../../countries/country.service";
import { Zone } from "../../zones/zone.model";
import { ZoneService } from "../../zones/zone.service";
import { Corporate, CorporateLevel, MasterCorporate } from "../corporate.model";
import { CorporateService } from "../corporate.service";
import { CorporateOuService } from "../../organizational-chart/corporate-ou.service";

@Component({
  selector: "app-add-corporate",
  templateUrl: "./add-corporate.component.html",
  styleUrls: ["../../../scss/create.style.scss"],
})
export class AddCorporateComponent implements OnInit, OnDestroy {
  @ViewChild("corporateForm") submitForm: NgForm;
  private subs = new SubSink();
  corporate = new Corporate();
  corporateId: number;
  countries: Country[] = [];
  corporateLevels: CorporateLevel[] = [];
  masterCorporates: MasterCorporate[] = [];
  active = true;
  userType: string;
  isUpdateView: boolean;
  cities: City[] = [];
  zones: Zone[] = [];
  checked = false;
  contractUploader: FileUploader;
  bankStatementUploader: FileUploader;
  currentLang: string;
  hasChildOus = false;

  constructor(
    private route: ActivatedRoute,
    private corporateService: CorporateService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private countryService: CountryService,
    private authService: AuthService,
    private cityService: CityService,
    private zoneService: ZoneService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateOuService: CorporateOuService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    );
    this.getCountries();
    this.getCorporateLevels();
    this.getMasterCorporates();
    this.getOusForCorporate();
    if (this.isUpdateView) {
      this.getCorporate();
    }
  }

  createCorporate() {
    this.corporate.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.corporateService.createCorporate(this.corporate).subscribe(
          (corporate) => {
            this.translate.get("createSuccessMsg").subscribe((res) => {
              this.handleSuccessResponse(res, corporate.id);
            });
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  updateCorporate() {
    this.corporate.suspended = !this.active;
    if (this.submitForm.valid && this.corporateId) {
      
      this.subs.add(
        this.corporateService
          .updateCorporate(this.corporateId, this.corporate)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporateId);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries({ suspended: false }).subscribe(
        (countries: BaseResponse<Country>) => {
          if (countries.content?.length > 0) {
            this.countries = countries.content;
          } else {
            this.translate
              .get(["error.noCountryFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCities(countryId: number) {
    if (countryId) {
      
      this.subs.add(
        this.cityService.getCities(countryId).subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content?.length > 0) {
              this.cities = cities.content;
            } else {
              this.corporate.cityId = null;
              this.corporate.zoneId = null;
              this.cities = [];
              this.zones = [];
              this.translate
                .get(["error.noCityFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
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

  getZones(countryId: number, cityId: number) {
    if (countryId && cityId) {
      
      this.subs.add(
        this.zoneService.getCityZones(countryId, cityId).subscribe(
          (zones) => {
            if (zones.content?.length > 0) {
              this.zones = zones.content;
            } else {
              this.corporate.zoneId = null;
              this.zones = [];
              this.translate
                .get(["error.noZoneFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
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

  getCorporateLevels() {
    
    this.subs.add(
      this.corporateService.getCorporateLevels({ suspended: false }).subscribe(
        (corporateLevels: BaseResponse<Corporate>) => {
          if (corporateLevels.content?.length > 0) {
            this.corporateLevels = corporateLevels.content;
          } else {
            this.translate
              .get(["error.noCorporateLevelFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMasterCorporates() {
    
    this.subs.add(
      this.corporateService.getMasterCorporates({ suspended: false }).subscribe(
        (masterCorporates: BaseResponse<MasterCorporate>) => {
          if (masterCorporates.content?.length > 0) {
            this.masterCorporates = masterCorporates.content;
          } else {
            this.translate
              .get(["error.noMasterCorporatesFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporate() {
    if (this.corporateId) {
      
      this.subs.add(
        this.corporateService.getCorporate(this.corporateId).subscribe(
          (corporate: Corporate) => {
            if (corporate) {
              this.corporate = corporate;
              this.active = !corporate.suspended;
              this.getCities(this.corporate.countryId);
              this.getZones(this.corporate.countryId, this.corporate.cityId);
            } else {
              this.translate
                .get(["error.noCorporateFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      console.error("no corporate id provided");
    }
  }

  getOusForCorporate() {
    if (this.corporateId) {
      this.subs.add(
        this.corporateOuService.getOusForCorporate(this.corporateId).subscribe(
          (ous) => {
            if (ous.length) {
              this.hasChildOus = ous.length > 1;
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    }
  }

  handleSuccessResponse(msg: string, corporateId: number) {
    
    this.router.navigate([
      `/${this.userType}/corporates`,
      corporateId,
      "details",
    ]);
    this.toastr.success(msg);
  }

  toggle(checked: boolean, name: string) {
    this[name] = checked;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
