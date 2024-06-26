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
import {City} from "../../cities/city.model";
import {CityService} from "../../cities/city.service";
import {Zone, ZoneGridData} from "../zone.model";
import {ZoneService} from "../zone.service";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-zones",
  templateUrl: "./list-zones.component.html",
  styleUrls: ["../../../scss/list.style.scss", "./list-zones.component.scss"],
})
export class ListZonesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  gridData: ZoneGridData[] = [];
  countryId: number;
  cityId: number;
  zoneId: number;
  currentLang: string;
  colData: ColData[] = [];
  zones: Zone[] = [];
  cityName: string;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private zoneService: ZoneService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private cityService: CityService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService : QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.countryId = params.countryId;
        this.cityId = params.cityId;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.zones);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.zoneId = id;
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
          this.getZones(this.countryId, this.cityId);
        }
      }),
    );
    this.getZones(this.countryId, this.cityId);
    this.getCity(this.countryId, this.cityId);
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "zone.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "zone.enName" : "zone.localeName"}`,
      },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: Zone[]) {
    this.gridData = data.map((zone) => {
      return {
        id: zone.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? zone.enName : zone.localeName,
        status: !zone.suspended ? "active" : "inactive",
      };
    });
  }

  // get zones
  getZones(countryId: number, cityId: number, searchObj?: AdvanceSearch) {
    if (countryId && cityId) {
      
      this.subs.add(
        this.zoneService
          .getCityZones(
            countryId,
            cityId,
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize
          )
          .subscribe(
            (zones: BaseResponse<Zone>) => {
              if (zones.content?.length > 0) {
                this.totalElements = zones.totalElements;
                this.zones = zones.content;
                this.setGridData(this.zones);
              } else {
                this.zones = [];
                this.totalElements = 0;
                this.setGridData([]);
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

  getCity(countryId: number, cityId: number) {
    if (countryId) {
      
      this.subs.add(
        this.cityService.getCity(countryId, cityId).subscribe(
          (city: City) => {
            if (city) {
              this.cityName =
                this.currentLang === "en" ? city.enName : city.localeName;
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

  deleteZone() {
    
    this.subs.add(
      this.zoneService
        .deleteZone(this.countryId, this.cityId, this.zoneId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getZones(this.countryId, this.cityId);
            
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
      this.getZones(this.countryId, this.cityId, this.submitForm?.value);
    }else{
      this.getZones(this.countryId, this.cityId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getZones(this.countryId, this.cityId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
