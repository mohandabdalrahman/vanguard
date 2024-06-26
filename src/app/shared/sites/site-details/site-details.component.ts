import { Component, OnInit } from "@angular/core";
import { ActivatedRoute} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { removeUnNeededProps } from "@helpers/remove-props";
import { TranslateService } from "@ngx-translate/core";
import { ContactTypeService } from "@shared/services/contact-type.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { City } from "app/admin/cities/city.model";
import { Zone } from "app/admin/zones/zone.model";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { CityService } from "../../../admin/cities/city.service";
import { CountryService } from "../../../admin/countries/country.service";
import { ProductCategory } from "../../../admin/product/product-category.model";
import { ZoneService } from "../../../admin/zones/zone.service";
import { AuthService } from "../../../auth/auth.service";
import { Country } from "./../../../admin/countries/country.model";
import { Bank } from "./../../bank-account/bank-account.model";
import { MerchantSite, SiteContact } from "./../site.model";
import { SiteService } from "./../site.service";
import { MerchantService } from "../../../admin/merchants/merchant.service";
import { BaseResponse } from "@models/response.model";
import {MerchantBillingAccountService} from "../../../admin/merchant-billing-account/merchant-billing-account.service";

@Component({
  selector: "app-site-details",
  templateUrl: "./site-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./site-details.component.scss",
  ],
})
export class SiteDetailsComponent implements OnInit {
  private subs = new SubSink();
  merchantId: number = null;
  products: ProductCategory[] = [];
  siteContact = new SiteContact();
  contacts: any;
  siteId: number = null;
  merchantSite = new MerchantSite();
  city: City = new City();
  country: Country = new Country();
  zone: Zone = new Zone();
  active = true;
  bank: Bank = new Bank();
  contactType: any;
  userType: string;
  currentLang: string;
  suspendedStatus: boolean;
  siteCurrentBalance : number;
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
    private contactTypeService: ContactTypeService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private MerchantBillingAccountService: MerchantBillingAccountService,

  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
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
    this.getBillingAccount();
    if (this.merchantId && this.siteId) {
      this.getSiteDetails();
    }
  }

  getBillingAccount() {
    
    this.subs.add(
      this.MerchantBillingAccountService.getBillingAccount(this.merchantId).subscribe(
        (account: BaseResponse<any>) => {
          if (account) {
            
            this.billingAccount = account;
          } 
          
        }
      )
    );
  }

  getCity() {
    
    this.subs.add(
      this.cityService
        .getCity(this.merchantSite.countryId, this.merchantSite.cityId)
        .subscribe(
          (city: City) => {
            if (city) {
              this.city = city;
              this.merchantSite["city"] =
                this.currentLang === "en"
                  ? city?.enName ?? ""
                  : city?.localeName ?? "";
              this.subs.add(
                this.translate.onLangChange.subscribe(() => {
                  this.merchantSite["city"] =
                    this.currentLang === "en"
                      ? city?.enName ?? ""
                      : city?.localeName ?? "";
                })
              );
            } else {
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
  }

  getCountry() {
    
    this.subs.add(
      this.countryService.getCountry(this.merchantSite.countryId).subscribe(
        (country: Country) => {
          if (country) {
            this.country = country;
            this.merchantSite["country"] =
              this.currentLang === "en"
                ? country?.enName ?? ""
                : country?.localeName ?? "";
            this.subs.add(
              this.translate.onLangChange.subscribe(() => {
                this.merchantSite["country"] =
                  this.currentLang === "en"
                    ? country?.enName ?? ""
                    : country?.localeName ?? "";
              })
            );
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

  getZone() {
    
    this.subs.add(
      this.zoneService
        .getZone(
          this.merchantSite.countryId,
          this.merchantSite.cityId,
          this.merchantSite.zoneId
        )
        .subscribe(
          (zone: Zone) => {
            if (zone) {
              this.zone = zone;
              this.merchantSite["zone"] =
                this.currentLang === "en"
                  ? zone?.enName ?? ""
                  : zone?.localeName ?? "";
              this.subs.add(
                this.translate.onLangChange.subscribe(() => {
                  this.merchantSite["zone"] =
                    this.currentLang === "en"
                      ? zone?.enName ?? ""
                      : zone?.localeName ?? "";
                })
              );
            } else {
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
  }

  getProducts() {
    let searchobj = { ids: [] };
    searchobj.ids = this.merchantSite.productIds;
    
    this.subs.add(
      this.siteService
        .getMerchantProducts(this.merchantId, removeNullProps(searchobj))
        .subscribe(
          (products: any) => {
            if (products) {
              this.products = products.content;
              this.merchantSite["products"] = this.products
                .map((p) => {
                  return this.currentLang === "en"
                    ? p?.enName ?? ""
                    : ((p?.localeName ?? "") as string);
                })
                .join(", ");
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

  getSiteDetails() {
    
    let deletedPropsFromSite = [
      "creatorId",
      "lastModifiedDate",
      "version",
      "creationDate",
      "deleted",
      "description",
      "merchantId",
      "id",
    ];
    let deletedPropsFromContact = [
      "creatorId",
      "lastModifiedDate",
      "version",
      "creationDate",
      "deleted",
      "description",
      "siteId",
      "contactTypeId",
      "suspended",
      "contactName",
      "id",
    ];
    this.subs.add(
      this.siteService.getMerchantSite(this.merchantId, this.siteId,this.includeBillingAccounts).subscribe(
        (merchantSite: MerchantSite) => {
          if (merchantSite) {
            const { suspended, siteBillingAccount, ...other } = removeUnNeededProps(
              merchantSite,
              deletedPropsFromSite
            );
            this.merchantSite = other;
            this.siteContact = Object.assign({}, merchantSite.siteContacts[0]);
            this.siteContact = removeUnNeededProps(
              this.siteContact,
              deletedPropsFromContact
            );
            this.suspendedStatus = !suspended;
            this.siteCurrentBalance = siteBillingAccount?.balance;
            this.getCountry();
            this.getCity();
            this.getBanks();
            this.getZone();
            this.getProducts();
            this.getContactType();

            delete this.merchantSite.productIds;
            delete this.merchantSite.cityId;
            delete this.merchantSite.countryId;
            delete this.merchantSite.zoneId;
            delete this.merchantSite.bankAccountId;
            delete this.merchantSite.siteContacts;
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

  getBanks() {
    
    this.subs.add(
      this.merchantService
        .getMerchantBankById(this.merchantId, this.merchantSite.bankAccountId)
        .subscribe(
          (banks: Bank) => {
            if (banks) {
              this.bank = banks;
              this.merchantSite["bankAccount"] =
                this.currentLang === "en"
                  ? banks?.enName ?? ""
                  : banks?.localeName ?? "";
              this.subs.add(
                this.translate.onLangChange.subscribe(() => {
                  this.merchantSite["bankAccount"] =
                    this.currentLang === "en"
                      ? banks?.enName ?? ""
                      : banks?.localeName ?? "";
                })
              );
            } else {
              this.translate
                .get(["error.noBankAccountFound", "type.warning"])
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

  getContactType() {
    
    this.subs.add(
      this.contactTypeService
        .getContactType(this.merchantSite.siteContacts[0].contactTypeId)
        .subscribe(
          (contactType) => {
            if (contactType) {
              this.contactType = contactType;
              this.merchantSite["contactType"] =
                this.currentLang === "en"
                  ? contactType?.enName ?? ""
                  : contactType?.localeName ?? "";
              this.translate.onLangChange.subscribe(() => {
                this.merchantSite["contactType"] =
                  this.currentLang === "en"
                    ? contactType?.enName ?? ""
                    : contactType?.localeName ?? "";
              });
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
}