import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";
import { City } from "app/admin/cities/city.model";
import { MerchantService } from "app/admin/merchants/merchant.service";
import { Zone } from "app/admin/zones/zone.model";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { CityService } from "../../../admin/cities/city.service";
import { CountryService } from "../../../admin/countries/country.service";
import { ZoneService } from "../../../admin/zones/zone.service";
import { MerchantSiteSearchObj } from "../site.model";
import { SiteService } from "../site.service";
import { Country } from "./../../../admin/countries/country.model";
import { MerchantSite } from "./../site.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {MerchantBillingAccountService} from "../../../admin/merchant-billing-account/merchant-billing-account.service";

@Component({
  selector: "app-list-sites",
  templateUrl: "./list-sites.component.html",
  styleUrls: ["../../../scss/list.style.scss", "./list-sites.component.scss"],
  // encapsulation: ViewEncapsulation.None,
})
export class ListSitesComponent implements OnInit {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  // gridData: Site[] = [];
  gridData: any = [];
  cities: City[] = [];
  zones: Zone[] = [];
  zonesList: Zone[] = [];
  colData: ColData[] = [];

  merchantId: any;
  private subs = new SubSink();
  countries: Country[] = [];
  siteSearchObj: MerchantSiteSearchObj = new MerchantSiteSearchObj();
  merchant: any;
  banks: [];
  active = false;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  siteId: number;
  currentPage: number = 1;
  totalElements: number;
  currentLang: string;
  countryId: number;
  zoneId: number;
  pageSize = 10;
  destroyed = new Subject<any>();
  includeBillingAccounts = true;
  billingAccount;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private zoneService: ZoneService,
    private cityService: CityService,
    private merchantService: MerchantService,
    private emitService: EmitService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    private router: Router,
    private MerchantBillingAccountService: MerchantBillingAccountService,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.gridData = [];
        this.setColData(this.currentLang);
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.siteId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getSites()
        }
      }),
    );
    this.getMerchantDetails();
    this.getBillingAccount();
    this.getBanks();
    this.getCountries();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "site.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "site.enName" : "site.localeName"}`,
      },
      this.billingAccount?.depositType == "SITE_DEPOSIT" && {
        field:"currentBalance" , header: "merchant.currentBalance"
      },
      { field: "zone", header: "site.zone" },
      { field: "city", header: "site.city" },
      { field: "status", header: "site.status" },
    ];
  }

  getMerchantDetails() {
    
    this.subs.add(
      this.merchantService.getMerchant(this.merchantId).subscribe(
        (merchant) => {
          if (merchant) {
            this.merchant = merchant;
            this.countryId = merchant.countryId;
            let search = new MerchantSiteSearchObj();
            search.countryId = merchant.countryId;
            search.merchantId = merchant.id;
            this.getSites(search);
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
        (account: BaseResponse<any>) => {
          if (account) {
            this.billingAccount = account;
            if(this.billingAccount.depositType == 'SITE_DEPOSIT'){
              this.setColData(this.currentLang);
            }
          }
          
        }
        )
    );
  }

  // get sites
  getSites(searchObj?: MerchantSiteSearchObj) {
    
    this.subs.add(
      this.siteService
        .getMerchantSiteList(
          this.merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.includeBillingAccounts
        )
        .subscribe(
          (sites) => {
            this.gridData = [];
            if (sites.content?.length > 0) {
              this.totalElements = sites.totalElements;
              this.getSiteData(sites.content, this.merchant.countryId);
              this.subs.add(
                this.translate.onLangChange.subscribe(() => {
                  this.gridData = [];
                  this.getSiteData(sites.content, this.merchant.countryId);
                })
              );
            } else {
              this.totalElements = 0;
              this.gridData = [];
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

  getSiteData(sites: MerchantSite[], countryId: number) {
    
    this.subs.add(
      this.cityService.getCities(countryId, null, null, 100).subscribe(
        (cities) => {
          this.cities = cities.content;
          this.zoneService
            .getZones(
              { citiesIds: cities.content.map((c) => c.id) , countryId },
              null,
              100
            )
            .subscribe((zones) => {
              this.zones = zones.content;
              sites.forEach((site) => {
                this.gridData.push({
                  id: site.id,
                  [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
                    this.currentLang === "en" ? site.enName : site.localeName,
                  currentBalance:site?.siteBillingAccount?.balance,
                  city:
                    this.currentLang === "en"
                      ? this.cities.find((city) => city.id === site.cityId)
                          ?.enName ?? ""
                      : this.cities.find((city) => city.id === site.cityId)
                          ?.localeName ?? "",
                  zone:
                    this.currentLang === "en"
                      ? zones.content.find((zone) => zone.id === site.zoneId)
                          ?.enName ?? ""
                      : zones.content.find((zone) => zone.id === site.zoneId)
                          ?.localeName ?? "",
                  status: !site.suspended ? "active" : "inactive",
                });
                
              });
            });
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries().subscribe(
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
    if (countryId !== undefined) {
      
      this.subs.add(
        this.cityService
          .getCities(this.merchant.countryId, null, null, 100)
          .subscribe(
            (cities: BaseResponse<City>) => {
              if (cities.content?.length > 0) {
                this.cities = cities.content;
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
    } else {
      console.error("no country id provided");
    }
  }

  getZones(countryId: number, cityId: number) {
    if (countryId && cityId) {
      this.zoneId = null;
      
      this.subs.add(
        this.zoneService
          .getCityZones(countryId, cityId, null, null, 100)
          .subscribe(
            (zones) => {
              if (zones.content?.length > 0) {
                this.zonesList = zones.content;
              } else {
                this.zonesList = [];
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

  getBanks() {
    
    this.subs.add(
      this.merchantService.getMerchantBanks(this.merchantId).subscribe(
        (banks: any) => {
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

  deleteSite() {
    
    this.subs.add(
      this.siteService
        .deleteMerchantSite(this.merchantId, this.siteId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getSites();
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getSites(this.submitForm?.value);
    }else{
      this.getSites();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getSites(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
