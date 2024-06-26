import { ContactTypeService } from "@shared/services/contact-type.service";
import {
  ProductCategory,
  ProductSearch,
} from "../../../admin/product/product-category.model";

import { SiteService } from "./../site.service";
import { Bank } from "./../../bank-account/bank-account.model";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BankAdvanceSearch } from "@models/place.model";
import { removeNullProps } from "@helpers/check-obj";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { CountryService } from "../../../admin/countries/country.service";
import { ZoneService } from "../../../admin/zones/zone.service";
import { CityService } from "../../../admin/cities/city.service";
import { Country } from "./../../../admin/countries/country.model";
import { MerchantSite, SiteContact } from "./../site.model";
import { BaseResponse } from "@models/response.model";
import { ErrorService } from "@shared/services/error.service";
import { City } from "app/admin/cities/city.model";
import { Zone } from "app/admin/zones/zone.model";
import { NgForm } from "@angular/forms";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { DepositType, Merchant } from "../../../admin/merchants/merchant.model";
import { MerchantService } from "../../../admin/merchants/merchant.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { TranslateService } from "@ngx-translate/core";
import { ContactType } from "@models/contact-type.model";
import {MerchantBillingAccountService} from "../../../admin/merchant-billing-account/merchant-billing-account.service";

@Component({
  selector: "app-create-site",
  templateUrl: "./create-site.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-site.component.scss",
  ],
})
export class CreateSiteComponent implements OnInit {
  isUpdateView: boolean;
  countries: Country[] = [];
  cities: City[] = [];
  zones: Zone[] = [];
  banks: Bank[] = [];
  active = true;
  merchantSite = new MerchantSite();
  private subs = new SubSink();
  private merchantId: number = null;
  products: ProductCategory[] = [];
  siteContact = new SiteContact();
  contacts: ContactType[];
  siteId: number = null;
  @ViewChild("addSiteForm") submitForm: NgForm;
  userType: string;
  countryName: string;
  countryId: number;
  currentLang: string;
  selectedContact: ContactType;
  depositType: DepositType;
  siteBalance: number = 0;
  billingAccount;
  includeBillingAccounts: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private zoneService: ZoneService,
    private cityService: CityService,
    private router: Router,
    private contactTypeService: ContactTypeService,
    private authService: AuthService,
    private merchantService: MerchantService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
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
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
        this.merchantSite.merchantId = +getRelatedSystemId(
          params,
          "merchantId"
        );
      }),
      this.route.params.subscribe((params) => {
        this.siteId = params["siteId"];
      })
    );

    this.getBanks();
    this.getMerchantProducts();
    this.getContactTypes();
    this.getMerchant();
    this.getBillingAccount();
    if (this.siteId && this.merchantId && this.isUpdateView) {
      this.getSiteDetails();
    }
  }

  addSite() {
    //mandatory to be primary contact with type id = 1
    this.siteContact.contactTypeId = 3;
    this.merchantSite.siteContacts.push(this.siteContact);
    this.merchantSite.suspended = !this.active;
    this.merchantSite.countryId = this.countryId;

    if (this.submitForm.valid) {
      
      this.subs.add(
        this.siteService
          .createMerchantSite(this.merchantId, this.merchantSite)
          .subscribe(
            (site) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, site.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  updateMerchantSite() {
    this.merchantSite.siteContacts.push(this.siteContact);
    this.merchantSite.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.siteService
          .updateMerchantSite(this.merchantId, this.siteId, this.merchantSite)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.siteId);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  getSiteDetails() {
    
    this.subs.add(
      this.siteService.getMerchantSite(this.merchantId, this.siteId, this.includeBillingAccounts).subscribe(
        (merchantSite: MerchantSite) => {
          if (merchantSite) {
            this.merchantSite = merchantSite;
            if(merchantSite?.siteContacts[0]){
              this.siteContact = merchantSite?.siteContacts[0];
            }           
            this.countryId = merchantSite?.countryId;
            this.active = !this.merchantSite?.suspended;
            this.siteBalance = merchantSite?.siteBillingAccount?.balance;
            this.getZones(this.countryId, this.merchantSite.cityId);
            this.getBanks();
          } else {
            this.translate
              .get(["error.noSitesFound", "type.warning"])
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

  getBillingAccount() {
    
    this.subs.add(
      this.MerchantBillingAccountService.getBillingAccount(this.merchantId).subscribe(
        (billingAccount) => {
          if (billingAccount) {
            this.billingAccount = billingAccount;
          } 
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMerchantProducts() {
    
    let searchObj: ProductSearch;
    this.subs.add(
      this.siteService
        .getMerchantProducts(
          this.merchantId,
          removeNullProps({ ...searchObj, suspended: false })
        )
        .subscribe(
          (products: BaseResponse<ProductCategory>) => {
            if (products.content?.length > 0) {
              this.products = products.content;
            } else {
              this.translate
                .get(["error.productsNotFound", "type.warning"])
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

  //  get banks
  getBanks(searchObj?: BankAdvanceSearch) {
    
    this.subs.add(
      this.merchantService
        .getMerchantBanks(
          this.merchantId,
          removeNullProps({ ...searchObj, suspended: false })
        )
        .subscribe(
          (banks: BaseResponse<Bank>) => {
            if (banks.content?.length > 0) {
              this.banks = banks.content;
            } else {
              this.translate
                .get(["error.noBanksFound", "type.warning"])
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

  getCountry(countryId: number) {
    
    this.subs.add(
      this.countryService.getCountry(countryId).subscribe(
        (country: Country) => {
          if (country) {
            this.countryName =
              this.currentLang === "en" ? country.enName : country.localeName;
            this.translate.onLangChange.subscribe(({ lang }) => {
              this.countryName =
                lang === "en" ? country.enName : country.localeName;
            });
            this.getCities(country.id);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  // get zones
  getZones(countryId: number, cityId: number) {
    if (countryId && cityId) {
      
      this.subs.add(
        this.zoneService
          .getCityZones(countryId, cityId, { suspended: false })
          .subscribe(
            (zones) => {
              if (zones.content?.length > 0) {
                this.zones = zones.content;
              } else {
                this.zones = [];
                this.merchantSite.zoneId = null;
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

  getMerchant() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant: Merchant) => {
          if (merchant) {
            this.countryId = merchant.countryId;
            this.getCountry(merchant.countryId);
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
        this.cityService.getCities(countryId, { suspended: false }).subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content?.length > 0) {
              this.cities = cities.content;
            } else {
              this.cities = [];
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

  getContactTypes() {
    
    this.subs.add(
      this.contactTypeService.getContactTypes().subscribe(
        (contacts: any) => {
          if (contacts?.content?.length > 0) {
            this.contacts = contacts.content;
            this.contacts = this.contacts.filter((ct) => ct.id === 1); // added to only choose the primary contact with id = 1
            this.selectedContact = this.contacts.filter((ct) => ct.id === 1)[0];
          } else {
            this.translate
              .get(["error.noContactTypesFound", "type.warning"])
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

  handleSuccessResponse(msg: string, siteId: number) {
    
    if (this.userType == "admin") {
      this.router.navigate([
        `/admin/merchants`,
        this.merchantId,
        "details",
        "sites",
        siteId,
        "details",
      ]);
    } else {
      this.router.navigate([`/merchant`, "sites", siteId, "details"]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
