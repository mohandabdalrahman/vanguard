import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { SubSink } from "subsink";
import { ColData } from "@models/column-data.model";
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { TranslateService } from "@ngx-translate/core";
import { removeNullProps } from "@helpers/check-obj";
import {  Merchant } from "../../merchants/merchant.model";
import { MerchantService } from "../../merchants/merchant.service";
import { EmitService } from "@shared/services/emit.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { NgForm } from "@angular/forms";
import { AuthService } from "../../../auth/auth.service";
import { SortView } from "@models/sort-view.model";
import { QueryParamsService } from "@shared/services/query-params.service";
import { FilterBtnComponent } from "@theme/components/filter-btn/filter-btn.component";
import { filter, takeUntil } from "rxjs/operators";
import { Subject, forkJoin } from "rxjs";
import { Otu, OtuSearchCriteriaDto } from "@models/otu.model";
import { BaseResponse } from "@models/response.model";
import { SiteService } from "@shared/sites/site.service";
import { MerchantSite } from "@shared/sites/site.model";
import { DeleteModalComponent } from "@theme/components/delete-modal/delete-modal.component";

@Component({
  selector: "app-list-corporate-otu",
  templateUrl: "./list-merchant-otu.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-otu.component.scss",
  ],
})
export class ListMerchantOtuComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantIds: number[];
  siteIds: number[];
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  merchantOtus: Otu[] = [];
  currentPage: number = 1;
  totalElements: number;
  fromDate: string;
  toDate: string;
  userType: string;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();
  merchants: Merchant[];
  sites: MerchantSite[];

  selectedOtuId: number;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private currentLangService: CurrentLangService,
    private authService: AuthService,
    private queryParamsService: QueryParamsService,
    private router: Router,
    private emitService: EmitService
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;;
        this.setColData();
        this.setGridData(this.merchantOtus);
      }),
      this.route.parent.params.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.selectedOtuId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getOtus();
        }
      }),
    );
    this.getOtus();
    //this.getMerchants();
    //this.getSites();
  }



  setColData() {
    this.colData = [
      { field: "id", header: "invoice.id" },
      { field: "merchant", header: "merchant.name" },
      { field: "site", header: "site.name" },
      { field: "deviceId", header: "otu.deviceId" },

    ];
  }

  setGridData(otus: Otu[]) {
    if (otus.length) {
      this.gridData = otus.map((otu) => {
        return {
          id: otu.id,
          deviceId: otu.DEVICE_ID,
          site:
            this.currentLang === "en"
              ? this.sites.find((s) => s.id == otu.SITE_ID)?.enName
              : this.sites.find((s) => s.id == otu.SITE_ID)?.localeName,
          merchant:
                this.currentLang === "en"
                  ? this.merchants.find((m)=>m.id == (this.sites.find((s) => s.id == otu.SITE_ID)?.merchantId))?.enName 
                  :this.merchants.find((m)=>m.id == (this.sites.find((s) => s.id == otu.SITE_ID)?.merchantId))?.localeName,
                  isGlobal:true //the only way where you wont show the update control on record !!
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getOtus(searchObj?: OtuSearchCriteriaDto) {
    
    this.setGridData([]);
    this.merchantOtus = [];
    this.subs.add(
      this.merchantService
        .getMerchantOtus(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (otu: BaseResponse<Otu>) => {
            if (this.pageSize) {
              if (otu.content?.length > 0) {
                this.totalElements = otu.totalElements;
                this.merchantOtus = otu.content;
                this.getOtuData(this.merchantOtus);
              } else {
                this.totalElements = 0;
                this.merchantOtus = [];
                this.setGridData([]);
                this.translate
                  .get(["error.noMerchantOtusFound", "type.warning"])
                  .subscribe((res) => {
                    this.toastr.warning(
                      Object.values(res)[0] as string,
                      Object.values(res)[1] as string
                    );
                  });
              }
              
            } else {
              
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getOtuData(merchantOtus: Otu[]) {
    if (merchantOtus?.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.siteService.getSiteList({
            ids: [...new Set(merchantOtus.map((t) => t.SITE_ID))],
          })
        ]).subscribe(([sitesOtu ]) => {
          
          this.sites = sitesOtu.content;
          this.getMerchantData(this.sites);
        })
      )
    } else {
      this.gridData = [];
    }
  }
  getMerchantData(sites: MerchantSite[]) {
    if (sites?.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.merchantService.getMerchants({
            ids: [...new Set(sites.map((t) => t.merchantId))],
          })
        ]).subscribe(([merchants ]) => {
          
          this.merchants = merchants.content;
          this.setGridData(this.merchantOtus);
        })
      )
    } else {
      this.gridData = [];
    }
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

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getOtus(
        this.submitForm?.value,
      );
    } else {
      this.getOtus(null);
    }
  }

  getMerchants() {
    
    this.subs.add(
      this.merchantService.getMerchants().subscribe(
        (merchants: BaseResponse<Merchant>) => {
          if (merchants?.content) {
            this.merchants = merchants.content;
          } else {
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

  getSites() {
    
    
    this.subs.add(
      this.siteService.getSiteList().subscribe(
        (sites: BaseResponse<MerchantSite>) => {
          if (sites?.content) {
            this.sites = sites.content;
          } else {
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

  deleteOtu() {
    
    let otu = this.merchantOtus.find((o) => o.id == this.selectedOtuId);
    let site = this.sites.find((s) => s.id == otu.SITE_ID);
    let merchant = this.merchants.find((m)=>m.id == site.merchantId);
    
    this.subs.add(
      this.merchantService.deleteOtu(merchant.id,site.id,this.selectedOtuId).subscribe(
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

  handleSearch() {
    this.currentPage = 1;
    this.getOtus(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
