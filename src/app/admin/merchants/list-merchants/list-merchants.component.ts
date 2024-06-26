import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";
import { Country } from "app/admin/countries/country.model";
import { CountryService } from "app/admin/countries/country.service";
import { AuthService } from "app/auth/auth.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { MasterMerchant } from "../../master-merchants/master-merchant.model";
import { MasterMerchantService } from "../../master-merchants/master-merchant.service";
import { merchantTabs } from "../merchant-tabs";
import { MasterSearch, Merchant, MerchantGridData } from "../merchant.model";
import { MerchantBalance, MerchantService } from "../merchant.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-merchants",
  templateUrl: "./list-merchants.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchants.component.scss",
  ],
})
export class ListMerchantsComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  gridData: MerchantGridData[] = [];
  merchants: Merchant[] = [];
  countries: Country[] = [];
  masterMerchants: MasterMerchant[] = [];
  currentLang: string;
  colData: any[] = [];
  masterMerchantName: string;
  merchantId: number;
  currentPage: number = 1;
  totalElements: number;
  fromDate: string;
  toDate: string;
  tabs = merchantTabs;
  activeTab: string;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private merchantService: MerchantService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private translate: TranslateService,
    private masterMerchantService: MasterMerchantService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router : Router
  ) {}

  ngOnInit(): void {
    const userRoles = this.authService.getLoggedInUserRoles();
    this.activeTab = this.tabs.find((tab) =>
      userRoles.includes(tab.role)
    )?.path;
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.merchants);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.merchantId = id;
        this.deleteModalComponent.open();
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchants();
        }
      }),
    );
    this.getCountries();
    this.getMerchants();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "merchant.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "merchant.enName" : "merchant.localeName"}`,
      },
      {
        field: `masterMerchant`,
        header: `${
          lang === "en" ? "masterMerchant.enName" : "masterMerchant.localeName"
        }`,
      },
      {
        field: "currentBalance",
        header: "app.currentBalance",
        sortable: false,
      },
      { field: "status", header: "merchant.status" },
    ];
  }

  setGridData(data: Merchant[]) {
    this.gridData = data.map((merchant) => {
      let master = this.masterMerchants.find((master) => {
        return master.id === merchant.masterMerchantId;
      });
      return {
        id: merchant.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? merchant.enName : merchant.localeName,
        masterMerchant:
          (master &&
            (this.currentLang === "en" ? master.enName : master.localeName)) ||
          "",
        currentBalance:
          merchant.currentBalance < 0 && this.currentLang === "ar"
            ? `${merchant.currentBalance * -1}-`
            : merchant.currentBalance,
        status: !merchant.suspended ? "active" : "inactive",
      };
    });
  }

  // get merchants
  getMerchants(searchObj?: MasterSearch) {
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) : null;
    }
    this.subs.add(
      this.merchantService
        .getMerchants(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (merchants: BaseResponse<Merchant>) => {
            if (merchants.content?.length > 0) {
              this.merchants = merchants.content;
              this.totalElements = merchants.totalElements;
              this.merchants.forEach((merchant) => {
                this.getMerchantBalance(merchant.id);
              });
              this.getMasterMerchants();
            } else {
              this.merchants = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  getMerchantBalance(merchantId: number) {
    this.subs.add(
      this.merchantService.getMerchantBalance(merchantId).subscribe(
        (balance: MerchantBalance) => {
          this.merchants.find((merchant) => {
            return merchant.id === merchantId;
          })["currentBalance"] = balance.merchantBalance;
          this.setGridData(this.merchants);
        },
        (err: string) => {
          if (err.includes("404")) {
            this.merchants.find((merchant) => {
              return merchant.id === merchantId;
            })["currentBalance"] = null;
            this.setGridData(this.merchants);
          } else {
            this.errorService.handleErrorResponse(err);
          }
        }
      )
    );
  }

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries().subscribe(
        (countries: BaseResponse<Country>) => {
          // check country content length
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

  getMasterMerchants() {
    
    this.subs.add(
      this.masterMerchantService.getMasterMerchants().subscribe(
        (masterMerchants: BaseResponse<MasterMerchant>) => {
          if (masterMerchants.content?.length > 0) {
            this.masterMerchants = masterMerchants.content;
            this.setGridData(this.merchants);
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

  deleteMerchant() {
    
    this.subs.add(
      this.merchantService.deleteMerchant(this.merchantId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getMerchants();
          
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
      this.getMerchants(this.submitForm?.value);
    }else{
      this.getMerchants();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchants(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
