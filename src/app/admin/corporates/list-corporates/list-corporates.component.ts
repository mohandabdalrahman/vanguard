import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { ColData } from "@models/column-data.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";
import { AuthService } from "app/auth/auth.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { corporateTabs } from "../corporate-tabs";
import {
  Corporate,
  CorporateGridData,
  CorporateLevel,
  CorporateSearch,
  MasterCorporate,
} from "../corporate.model";
import { CorporateService } from "../corporate.service";
import { SortView } from "@models/sort-view.model";
import { Country } from "../../countries/country.model";
import { CountryService } from "../../countries/country.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { QueryParamsService } from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-corporates",
  templateUrl: "./list-corporates.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporates.component.scss",
  ],
})
export class ListCorporatesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  corporateLevels: CorporateLevel[] = [];
  masterCorporates: MasterCorporate[] = [];
  corporates: Corporate[] = [];
  currentLang: string;
  gridData: CorporateGridData[] = [];
  colData: ColData[] = [];
  corporateId: number;
  currentPage: number = 1;
  totalElements: number;
  tabs = corporateTabs;
  activeTab: string;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  userType: string;
  relatedSystemIds: string;
  corporateIds: number[];
  countries: Country[] = [];
  hasCorporateBillingAccountListRole: boolean;
  destroyed = new Subject<any>();

  constructor(
    private corporateService: CorporateService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private authService: AuthService,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userRoles = this.authService.getLoggedInUserRoles();
    this.hasCorporateBillingAccountListRole = userRoles.includes(
      "CORPORATE_BILLING_ACCOUNT_LIST"
    );
    this.activeTab = this.tabs.find((tab) =>
      userRoles.includes(tab.role)
    )?.path;
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.relatedSystemIds = sessionStorage.getItem("relatedSystemIds");
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.corporates);
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getCorporates({
            ids: this.relatedSystemIds
              ? this.relatedSystemIds?.split(",")?.map(Number)
              : null,
          });        }
      }),
    );
    if (this.userType === "admin") {
      this.getCountries();
    }
    this.getCorporates({
      ids: this.relatedSystemIds
        ? this.relatedSystemIds?.split(",")?.map(Number)
        : null,
    });
    this.getCorporateLevels();
  }

  setColData(lang: string) {
    const commonFields: ColData[] = [
      { field: "id", header: "corporates.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "corporates.enName" : "corporates.localeName"
        }`,
      },
    ];
    if (this.hasCorporateBillingAccountListRole) {
      commonFields.push({
        field: "currentBalance",
        header: "corporates.currentBalance",
        sortable: false,
      });
    }
    if (this.userType === "admin") {
      this.colData = [
        ...commonFields,
        { field: "masterCorporate", header: "masterCorporate.name" },
        { field: "status", header: "app.status" },
      ];
    }
    if (this.userType === "master_corporate") {
      this.colData = [
        ...commonFields,
        { field: "openingBalance", header: "billingAccount.openingBalance" },
        { field: "status", header: "app.status" },
      ];
    }
  }

  setGridData(data: Corporate[]) {
    this.gridData = data.map((corporate) => {
      return {
        id: corporate.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? corporate.enName : corporate.localeName,
        ...(this.hasCorporateBillingAccountListRole && {
          currentBalance: corporate?.billingAccount?.currentBalance ? +corporate?.billingAccount?.currentBalance?.toFixed(2) : null,
        }),
        ...(this.userType === "admin" && {
          masterCorporate:
            this.currentLang === "en"
              ? this.masterCorporates.find(
                  (masterCorporate) =>
                    masterCorporate.id === corporate.masterCorporateId
                )?.enName ?? ""
              : this.masterCorporates.find(
                  (masterCorporate) =>
                    masterCorporate.id === corporate.masterCorporateId
                )?.localeName ?? "",
        }),
        ...(this.userType === "master_corporate" && {
          openingBalance: corporate?.billingAccount?.openingBalance,
        }),
        status: !corporate.suspended ? "active" : "inactive",
      };
    });
  }

  getCorporates(searchObj?: CorporateSearch) {
    let includeBillingAccounts = true;
    
    this.subs.add(
      this.corporateService
        .getCorporates(
          removeNullProps(searchObj),
          includeBillingAccounts,
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (corporates: BaseResponse<Corporate>) => {
            if (corporates.content?.length > 0) {
              this.totalElements = corporates.totalElements;
              this.corporates = corporates.content;
              this.setGridData(this.corporates);
              this.getMasterCorporates();
            } else {
              this.corporates = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  getCorporateLevels() {
    
    this.subs.add(
      this.corporateService.getCorporateLevels().subscribe(
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
      this.corporateService.getMasterCorporates().subscribe(
        (masterCorporates: BaseResponse<MasterCorporate>) => {
          if (masterCorporates.content?.length > 0) {
            this.masterCorporates = masterCorporates.content;
            this.setGridData(this.corporates);
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

  deleteCorporate() {
    
    this.subs.add(
      this.corporateService.deleteCorporate(this.corporateId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getCorporates({
            ids: this.relatedSystemIds
              ? this.relatedSystemIds?.split(",")?.map(Number)
              : null,
          });
          
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

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getCorporates({
        ...this.submitForm?.value,
        ids: this.relatedSystemIds
          ? this.relatedSystemIds?.split(",")?.map(Number)
          : null,
      });
    }else{
      this.getCorporates({
        ids: this.relatedSystemIds
          ? this.relatedSystemIds?.split(",")?.map(Number)
          : null,
      });
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporates({
      ...this.submitForm?.value,
      ids: this.corporateIds,
    });
  }

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
