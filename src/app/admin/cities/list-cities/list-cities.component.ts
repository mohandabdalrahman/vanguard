import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {ColData} from "@models/column-data.model";
import {AdvanceSearch} from "@models/place.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {Country} from "../../countries/country.model";
import {CountryService} from "../../countries/country.service";
import {City, CityGridData} from "../city.model";
import {CityService} from "../city.service";
import {SortView} from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-cities",
  templateUrl: "./list-cities.component.html",
  styleUrls: ["../../../scss/list.style.scss", "./list-cities.component.scss"],
})
export class ListCitiesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  countryId: number;
  currentLang: string;
  gridData: CityGridData[] = [];
  colData: ColData[] = [];
  cities: City[] = [];
  countryName: string;
  cityId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private cityService: CityService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);

    this.subs.add(
      this.route.params.subscribe((params) => {
        this.countryId = params["countryId"];
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.cities);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.cityId = id;
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
          this.getCities(this.countryId);
        }
      }),
    );
    this.getCountry();
    this.getCities(this.countryId);
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "city.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "city.enName" : "city.localeName"}`,
      },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: City[]) {
    this.gridData = data.map((city) => {
      return {
        id: city.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? city.enName : city.localeName,
        status: !city.suspended ? "active" : "inactive",
      };
    });
  }

  getCities(countryId: number, searchObj?: AdvanceSearch) {
    if (countryId) {
      
      this.subs.add(
        this.cityService
          .getCities(
            countryId,
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize,
            this.sortDirection,
            this.sortBy
          )
          .subscribe(
            (cities: BaseResponse<City>) => {
              if (cities.content?.length > 0) {
                this.totalElements = cities.totalElements;
                this.cities = cities.content;
                this.setGridData(this.cities);
              } else {
                this.cities = [];
                this.totalElements = 0;
                this.setGridData([]);
                this.translate
                  .get(["error.noCityFound", "type.warning"])
                  .subscribe((res) => {
                    this.toastr.warning(
                      Object.values(res)[0] as string,
                      Object.values(res)[1] as string
                    );
                  });
                //this.toastr.warning("No cities found");
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

  getCountry() {
    
    this.subs.add(
      this.countryService.getCountry(this.countryId).subscribe(
        (country: Country) => {
          // check country
          if (country) {
            this.countryName =
              this.currentLang === "en" ? country.enName : country.localeName;
          } else {
            this.translate
              .get(["error.noCountryFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
            //this.toastr.warning("No country found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  deleteCity() {
    
    this.subs.add(
      this.cityService.deleteCity(this.countryId, this.cityId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getCities(this.countryId);
          
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
    this.handlePagination()
  }


  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination()
  }

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getCities(this.countryId, this.submitForm?.value);
    }else{
      this.getCities(this.countryId);
    }
  }


  handleSearch() {
    this.currentPage = 1;
    this.getCities(this.countryId, this.submitForm?.value);
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination()
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
