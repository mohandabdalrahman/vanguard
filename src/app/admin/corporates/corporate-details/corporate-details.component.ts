import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {removeUnNeededProps} from "@helpers/remove-props";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {SubSink} from "subsink";
import {AuthService} from "../../../auth/auth.service";
import {CityService} from "../../cities/city.service";
import {CountryService} from "../../countries/country.service";
import {ZoneService} from "../../zones/zone.service";
import {corporateTabs} from "../corporate-tabs";
import {Corporate, CorporateLevel} from "../corporate.model";
import {CorporateService} from "../corporate.service";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {Country} from "../../countries/country.model";
import {City} from "../../cities/city.model";
import {Zone} from "../../zones/zone.model";
import {CorporateOuBrief} from "../../organizational-chart/corporate-ou.model";
import {ContextMenu} from "@theme/components/context-menu/context-menu.model";
import {ModalComponent} from "@theme/components/modal/modal.component";

@Component({
  selector: "app-corporate-details",
  templateUrl: "./corporate-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-details.component.scss",
  ],
})
export class CorporateDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("detailsModal") detailsModal: ModalComponent;
  @ViewChild("attachmentsModal") attachmentsModal: ModalComponent;
  corporate = {};
  corporateId: number;
  corporateLevelName: string;
  masterCorporateName: string;
  countryName: string;
  userType: string;
  currentLang: string;
  corporateName: string;
  status: string;
  ouStatus: string;

  tabs = [];
  corporateLevel: CorporateLevel;
  country: Country;
  city: City;
  zone: Zone;
  rootOu: CorporateOuBrief;
  showOuHierarchy = false;
  corporateOuStatus: boolean;
  items: Partial<ContextMenu>[] = [];

  constructor(
    private route: ActivatedRoute,
    private corporateService: CorporateService,
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    public authService: AuthService,
    private cityService: CityService,
    private zoneService: ZoneService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateOuService: CorporateOuService
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        title: "details",
        icon: "icons-view",
        role: "CORPORATE_VIEW",
        actionMethod: () => this.detailsModal.open(),
      },
      {
        title: "attachments",
        icon: "icons-edit",
        role: "CORPORATE_DOCUMENT_LIST",
        actionMethod: () => this.attachmentsModal.open(),
      },
    ];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    if (this.userType === "master_corporate") {
      this.tabs = corporateTabs;
    } else {
      //remove report and dashboard tabs
      this.tabs = corporateTabs.slice(0, -1);
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setCorporateData();
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    );
    if (this.corporateId) {
      this.showCorporateDetails();
    } else {
      this.translate
        .get(["error.invalidUrl", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  showCorporateDetails(): void {
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            const unNeededProps = [
              "masterCorporateId",
              "lastModifiedDate",
              "creationDate",
              "billingAccount",
              "corporateDocuments"
            ];
            if (this.userType === "master_corporate") {
              unNeededProps.push("commercialRegistrationNumber");
            }
            const {
              corporateLevelId,
              countryId,
              cityId,
              zoneId,
              suspended,
              enName,
              localeName,
              ouEnabled,
              rootOuId,
              ...other
            } = removeUnNeededProps(corporate, unNeededProps);

            if (rootOuId) {
              sessionStorage.setItem("rootOuId", rootOuId.toString());
              this.showOuHierarchy = true;
            }
            this.corporateOuStatus = ouEnabled;
            sessionStorage.setItem("adminCorporateOuEnabled", ouEnabled.toString());


            this.corporateName =
              this.currentLang === "en" ? enName : localeName;
            this.subs.add(
              this.translate.onLangChange.subscribe(({lang}) => {
                this.currentLang = lang;
                this.corporateName =
                  this.currentLang === "en" ? enName : localeName;
              })
            );
            this.corporate = other;

            this.status = !suspended ? "active" : "inactive";
            this.ouStatus = ouEnabled ? "active" : "inactive";
            this.getCorporateData(corporate);
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
  }

  getCorporateData(corporate: Corporate) {
    this.subs.add(
      forkJoin([
        this.corporateService.getCorporateLevel(corporate?.corporateLevelId),
        this.countryService.getCountry(corporate?.countryId),
        this.cityService.getCity(corporate?.countryId, corporate?.cityId),
        this.zoneService.getZone(
          corporate?.countryId,
          corporate?.cityId,
          corporate?.zoneId
        ),
      ]).subscribe(
        ([corporateLevel, country, city, zone]) => {
          this.corporateLevel = corporateLevel;
          this.country = country;
          this.city = city;
          this.zone = zone;
          this.setCorporateData();
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      ),
    );
    if (corporate.rootOuId) {
      this.subs.add(
        this.corporateOuService.getCorporateOuBrief(this.corporateId, corporate.rootOuId).subscribe(rootOu => {
            this.rootOu = rootOu;
            this.setCorporateData();
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }),
      );
    }
  }

  setCorporateData() {
    this.corporate["corporateLevelName"] =
      this.currentLang === "en"
        ? this.corporateLevel?.enName ?? ""
        : this.corporateLevel?.localeName ?? "";
    this.corporate["country"] =
      this.currentLang === "en"
        ? this.country?.enName ?? ""
        : this.country?.localeName ?? "";
    this.corporate["city"] =
      this.currentLang === "en"
        ? this.city?.enName ?? ""
        : this.city?.localeName ?? "";
    this.corporate["zone"] =
      this.currentLang === "en"
        ? this.zone?.enName ?? ""
        : this.zone?.localeName ?? "";
    this.corporate["rootOuName"] =
      this.currentLang === "en"
        ? this.rootOu?.enName ?? ""
        : this.rootOu?.localeName ?? "";
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
