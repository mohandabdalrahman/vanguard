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
  MasterMerchant,
  MasterMerchantGridData,
} from "../master-merchant.model";
import { MasterMerchantService } from "../master-merchant.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-master-merchants",
  templateUrl: "./list-master-merchants.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-master-merchants.component.scss",
  ],
})
export class ListMasterMerchantsComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentLang: string;
  gridData: MasterMerchantGridData[] = [];
  colData: ColData[] = [];
  masterMerchants: MasterMerchant[] = [];
  masterMerchantId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private masterMerchantService: MasterMerchantService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private  router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.masterMerchants);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.masterMerchantId = id;
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
          this.getMasterMerchants();
        }
      }),
    );
    this.getMasterMerchants();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "masterMerchant.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "masterMerchant.enName" : "masterMerchant.localeName"
        }`,
      },
      { field: "balance", header: "masterMerchant.balance" },
      { field: "merchant", header: "merchant.title" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: MasterMerchant[]) {
    this.gridData = data.map((masterMerchant) => {
      return {
        id: masterMerchant.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? masterMerchant.enName
            : masterMerchant.localeName,
        merchant: masterMerchant.merchants
          .map((merchant) =>
            this.currentLang === "en" ? merchant.enName : merchant.localeName
          )
          .join(", "),
        status: !masterMerchant.suspended ? "active" : "inactive",
        balance: masterMerchant.balance,
      };
    });
  }

  getMasterMerchants(searchObj?: AdvanceSearch) {
    
    this.subs.add(
      this.masterMerchantService
        .getMasterMerchants(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (masterMerchants: BaseResponse<MasterMerchant>) => {
            if (masterMerchants?.content?.length) {
              this.totalElements = masterMerchants.totalElements;
              this.masterMerchants = masterMerchants.content;
              this.setGridData(this.masterMerchants);
            } else {
              this.masterMerchants = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  deleteMasterMerchant() {
    
    this.subs.add(
      this.masterMerchantService
        .deleteMasterMerchant(this.masterMerchantId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getMasterMerchants();
            
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
      this.getMasterMerchants(this.submitForm?.value);
    }else{
      this.getMasterMerchants();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
