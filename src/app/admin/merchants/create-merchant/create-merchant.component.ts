import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {Country} from "app/admin/countries/country.model";
import {CountryService} from "app/admin/countries/country.service";
import {FileUploader} from "ng2-file-upload";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {AuthService} from "../../../auth/auth.service";
import {City} from "../../cities/city.model";
import {CityService} from "../../cities/city.service";
import {MasterMerchant} from "../../master-merchants/master-merchant.model";
import {MasterMerchantService} from "../../master-merchants/master-merchant.service";
import {Zone} from "../../zones/zone.model";
import {ZoneService} from "../../zones/zone.service";
import {DepositType, Merchant} from "../merchant.model";
import {MerchantBalance, MerchantService} from "../merchant.service";
import {MerchantBillingAccountService} from "../../merchant-billing-account/merchant-billing-account.service";

@Component({
  selector: "app-create-merchant",
  templateUrl: "./create-merchant.component.html",
  styleUrls: ["../../../scss/create.style.scss"],
})
export class CreateMerchantComponent implements OnInit, OnDestroy {
  @ViewChild("createMerchantForm") submitForm: NgForm;
  private subs = new SubSink();
  merchant = new Merchant();
  masterMerchants = [];
  isUpdateView: boolean;
  active = true;
  countries: Country[] = [];
  merchantId: number;
  contractUploader: FileUploader;
  bankStatementUploader: FileUploader;
  userType: string;
  cities: City[] = [];
  zones: Zone[] = [];
  checked = false;
  currentLang: string;
  oldDepositType: DepositType;
  merchantCurrentBalance: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private merchantService: MerchantService,
    private countryService: CountryService,
    private masterMerchantService: MasterMerchantService,
    private authService: AuthService,
    private zoneService: ZoneService,
    private cityService: CityService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private MerchantBillingAccountService: MerchantBillingAccountService,
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
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      })
    );

    if (this.isUpdateView) {
      this.getMerchant();
      this.getMerchantBalance(this.merchantId);
      this. getBillingAccount();
    }

    this.getMasterMerchants();
    this.getCountries();
  }

  getMerchantBalance(merchantId: number) {
    this.subs.add(
      this.merchantService.getMerchantBalance(merchantId).subscribe(
        (balance: MerchantBalance) => {
          this.merchantCurrentBalance = balance.merchantBalance;
        },
        (err: string) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }
  getBillingAccount() {
    
    this.subs.add(
      this.MerchantBillingAccountService.getBillingAccount(this.merchantId).subscribe(
        (account: BaseResponse<any>) => {
          if (account) {
            this.oldDepositType = account['depositType'];
          } 
          
        }
      )
    );
  }


  createMerchant() {
    this.merchant.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.merchantService.createMerchant(this.merchant).subscribe(
          (merchant) => {
            this.translate.get("createSuccessMsg").subscribe((res) => {
              this.handleSuccessResponse(res, merchant.id);
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

  getMerchant() {
    if (this.merchantId) {
      
      this.subs.add(
        this.merchantService.getMerchant(this.merchantId).subscribe(
          (merchant: Merchant) => {
            
            this.merchant = merchant;
            this.active = !merchant.suspended;
            this.getCities(this.merchant.countryId);
            this.getZones(this.merchant.countryId, this.merchant.cityId);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      console.error("no merchant id provided");
    }
  }

  updateMerchant() {
    this.merchant.suspended = !this.active;
    this.merchant.depositTypeEnum = this.oldDepositType ;
    if (this.submitForm.valid && this.merchant.id) {
      
      this.subs.add(
        this.merchantService
          .updateMerchant(this.merchant.id, this.merchant)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.merchant.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  getMasterMerchants() {
    
    this.subs.add(
      this.masterMerchantService.getMasterMerchants(null,null,100).subscribe(
        (masterMerchants: BaseResponse<MasterMerchant>) => {
          if (masterMerchants.content?.length > 0) {
            this.masterMerchants = masterMerchants.content;
          } else {
            this.translate
              .get(["error.noMasterMerchantsFound", "type.warning"])
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
              this.merchant.cityId = null;
              this.merchant.zoneId = null;
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
              this.merchant.zoneId = null;
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

  handleSuccessResponse(msg: string, merchantId: number) {
    
    this.router.navigate([
      `/${this.userType}/merchants`,
      merchantId,
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
