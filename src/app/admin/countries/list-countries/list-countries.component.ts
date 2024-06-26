import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { Country, CountryGridData } from "../country.model";
import { CountryService } from "../country.service";
import { SortView } from "@models/sort-view.model";
import { ColData } from "@models/column-data.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { QueryParamsService } from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-countries",
  templateUrl: "./list-countries.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-countries.component.scss",
  ],
})
export class ListCountriesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  private subs = new SubSink();
  currentLang: string;
  gridData: CountryGridData[] = [];
  colData: ColData[] = [];
  countries: Country[] = [];
  countryId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private countryService: CountryService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.countries);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.countryId = id;
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
          this.getCountries();
        }
      }),
    );
    this.getCountries();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "country.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "country.enName" : "country.localeName"}`,
      },
      { field: "currency", header: "country.currency" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: Country[]) {
    this.gridData = data.map((country: Country) => {
      return {
        id: country.id,
        currency: country?.currency?.code,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? country.enName : country.localeName,
        localeName: country.localeName,
        status: !country.suspended ? "active" : "inactive",
      };
    });
  }

  getCountries(searchObj?: AdvanceSearch) {
    
    this.subs.add(
      this.countryService
        .getCountries(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (countries: BaseResponse<Country>) => {
            // check country content length
            if (countries.content?.length > 0) {
              this.totalElements = countries.totalElements;
              this.countries = countries.content;
              this.setGridData(this.countries);
            } else {
              this.countries = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  deleteCountry() {
    
    this.subs.add(
      this.countryService.deleteCountry(this.countryId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getCountries();
          
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
      this.getCountries(this.submitForm?.value);
    }else{
      this.getCountries();
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCountries(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
