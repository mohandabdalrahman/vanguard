import {Component, OnDestroy, OnInit} from "@angular/core";
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
import {MasterMerchantService} from "../../master-merchants/master-merchant.service";
import {ZoneService} from "../../zones/zone.service";
import {merchantTabs} from "../merchant-tabs";
import {Merchant} from "../merchant.model";
import {MerchantService} from "../merchant.service";

@Component({
  selector: "app-merchant-details",
  templateUrl: "./merchant-details.component.html",
  styleUrls: ["./merchant-details.component.scss"],
})
export class MerchantDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantId: number;
  merchant = {};
  merchantName: string;
  userType: string;
  currentLang: string;
  suspended: boolean;
  skipHoldingTax: boolean;
  tabs = merchantTabs;
  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private merchantService: MerchantService,
    private countryService: CountryService,
    private authService: AuthService,
    private cityService: CityService,
    private zoneService: ZoneService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private masterMerchantService: MasterMerchantService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),

      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      })
    );

    if (this.merchantId) {
      this.getMerchantById();
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

  getMerchantById() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant) {
            const {
              countryId,
              enName,
              localeName,
              cityId,
              zoneId,
              suspended,
              skipHoldingTax,
              masterMerchantId,
              ...other
            } = removeUnNeededProps(merchant, [
              "lastModifiedDate",
              "creationDate",
              "depositTypeEnum",
              "id",
            ]);
            this.merchantName = this.currentLang === "en" ? enName : localeName;
            this.subs.add(
              this.translate.onLangChange.subscribe(({ lang }) => {
                this.currentLang = lang;
                this.merchantName =
                  this.currentLang === "en" ? enName : localeName;
              })
            );
            this.suspended = suspended;
            this.skipHoldingTax = skipHoldingTax;
            this.merchant = other;
            this.getMerchantData(merchant);
            //TODO: get master merchant
          } else {
            this.translate
              .get(["error.noMerchantsFound", "type.warning"])
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

  getMerchantData(merchant: Merchant) {
    

    if (merchant.masterMerchantId) {
      this.subs.add(
        this.masterMerchantService
          .getMasterMerchantById(merchant.masterMerchantId)
          .subscribe(
            (masterMerchant) => {
              this.merchant["masterMerchant"] =
                this.currentLang === "en"
                  ? masterMerchant?.enName ?? ""
                  : masterMerchant?.localeName ?? "";
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
    this.subs.add(
      forkJoin([
        this.countryService.getCountry(merchant?.countryId),
        this.cityService.getCity(merchant?.countryId, merchant?.cityId),
        this.zoneService.getZone(
          merchant?.countryId,
          merchant?.cityId,
          merchant?.zoneId
        ),
      ]).subscribe(
        ([country, city, zone]) => {
          
          this.handleLangChange(country, city, zone);
          this.subs.add(
            this.translate.onLangChange.subscribe(() => {
              this.handleLangChange(country, city, zone);
            })
          );
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  handleLangChange(country, city, zone) {
    this.merchant["country"] =
      this.currentLang === "en"
        ? country?.enName ?? ""
        : country?.localeName ?? "";
    this.merchant["city"] =
      this.currentLang === "en" ? city?.enName ?? "" : city?.localeName ?? "";
    this.merchant["zone"] =
      this.currentLang === "en" ? zone?.enName ?? "" : zone?.localeName ?? "";
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
