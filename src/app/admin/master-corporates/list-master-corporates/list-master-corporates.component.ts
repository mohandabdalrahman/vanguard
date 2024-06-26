import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { ColData } from "@models/column-data.model";
import { AdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import {
  MasterCorporate,
  MasterCorporateGridData,
} from "../master-corporate.model";
import { MasterCorporateService } from "../master-corporate.service";
import { SortView } from "@models/sort-view.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { QueryParamsService } from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-master-corporates",
  templateUrl: "./list-master-corporates.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-master-corporates.component.scss",
  ],
})
export class ListMasterCorporatesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentLang: string;
  gridData: MasterCorporateGridData[] = [];
  colData: ColData[] = [];
  masterCorporates: MasterCorporate[] = [];
  masterCorporateId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private masterCorporateService: MasterCorporateService,
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
        this.setGridData(this.masterCorporates);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.masterCorporateId = id;
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
          this.getMasterCorporates();
        }
      }),
    );

    this.getMasterCorporates();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "masterCorporate.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en"
            ? "masterCorporate.enName"
            : "masterCorporate.localeName"
        }`,
      },
      { field: "description", header: "app.description" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: MasterCorporate[]) {
    this.gridData = data.map((masterCorporate) => {
      return {
        id: masterCorporate.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? masterCorporate.enName
            : masterCorporate.localeName,
        description: masterCorporate.description,
        status: !masterCorporate.suspended ? "active" : "inactive",
      };
    });
  }

  getMasterCorporates(searchObj?: AdvanceSearch) {
    
    this.subs.add(
      this.masterCorporateService
        .getMasterCorporates(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (masterCorporates: BaseResponse<MasterCorporate>) => {
            if (masterCorporates?.content?.length) {
              this.totalElements = masterCorporates.totalElements;
              this.masterCorporates = masterCorporates.content;
              this.setGridData(this.masterCorporates);
            } else {
              this.masterCorporates = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  deleteMasterCorporate() {
    
    this.subs.add(
      this.masterCorporateService
        .deleteMasterCorporate(this.masterCorporateId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getMasterCorporates();
            
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
      this.getMasterCorporates(this.submitForm?.value);
    }else{
      this.getMasterCorporates();
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMasterCorporates(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
