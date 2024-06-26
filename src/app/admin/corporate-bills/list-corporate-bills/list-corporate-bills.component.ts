import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { SubSink } from "subsink";
import { ColData } from "@models/column-data.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { CorporateBillsService } from "../corporate-bills.service";
import { TranslateService } from "@ngx-translate/core";
import { EmitService } from "@shared/services/emit.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import { CorporateBill } from "../corporate-bills.model";
import { NgForm } from "@angular/forms";
import { Corporate } from "../../corporates/corporate.model";
import { CorporateService } from "../../corporates/corporate.service";
import { AuthService } from "../../../auth/auth.service";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-corporate-bills",
  templateUrl: "./list-corporate-bills.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-bills.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListCorporateBillsComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  corporateBillId: number;
  currentPage: number = 1;
  totalElements: number;
  corporateBills: CorporateBill[] = [];
  toDate: string;
  fromDate: string;
  pageSize = 10;
  isTabsView: boolean;
  corporates: Corporate[] = [];
  userType: string;
  TWO_HRS_TO_MILLI_SECS = 7200000;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private corporateBillsService: CorporateBillsService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private corporateService: CorporateService,
    private authService: AuthService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.isTabsView = !!this.route.snapshot.data["view"];
    this.userType = this.authService.getUserType();
    this.setColData(this.currentLang);

    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.corporateBills);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getBills();
        }
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateBillId = id;
      })
    );
    this.getBills();
    if (!this.isTabsView) {
      this.getCorporates();
    }
  }

  setColData(lang: string) {
    this.colData = [
      this.isTabsView && { field: "id", header: "app.id" },
      !this.isTabsView && {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "corporates.enName" : "corporates.localeName"
        }`,
      },
      { field: "fromDate", header: "bill.fromDate" },
      { field: "toDate", header: "bill.toDate" },
      { field: "grossAmount", header: "bill.grossAmount" },
    ];
  }

  setGridData(data: CorporateBill[]) {
    this.gridData = data.map((corporateBill) => {
      return {
        id: corporateBill.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? corporateBill.corporateEnName
            : corporateBill.corporateLocaleName,
        grossAmount: corporateBill.totalAmount,
        fromDate: corporateBill.fromDate,
        toDate: corporateBill.toDate,
        isGlobal: true,
        userTypeId: corporateBill.corporateId,
      };
    });
  }

  getBills(searchObj?: any) {
    
    if (searchObj) {
      searchObj.toDate = this.toDate ? Date.parse(this.toDate) - this.TWO_HRS_TO_MILLI_SECS : null;
      searchObj.fromDate = this.fromDate ? Date.parse(this.fromDate) - this.TWO_HRS_TO_MILLI_SECS : null;
    }
    const calledFunc =
      this.isTabsView || this.userType === "corporate"
        ? this.corporateBillsService.getCorporateBills(
            this.corporateId,
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize
          )
        : this.corporateBillsService.getCorporatesBills(
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize
          );

    this.subs.add(
      calledFunc.subscribe(
        (corporateBills: BaseResponse<CorporateBill>) => {
          if (corporateBills.content?.length <= 0) {
            this.totalElements = 0;
            this.translate
              .get(["error.noCorporateBillsFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          this.totalElements = corporateBills.totalElements;
          this.corporateBills = corporateBills.content;
          this.setGridData(this.corporateBills);
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporates() {
    
    this.subs.add(
      this.corporateService.getCorporates().subscribe(
        (corporates: BaseResponse<Corporate>) => {
          if (corporates.content?.length > 0) {
            this.corporates = corporates.content;
          } else {
            this.corporates = [];
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
      this.getBills(this.submitForm?.value);
    }else{
      this.getBills();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    if(this.submitForm?.value){
    this.getBills(this.submitForm?.value);
    }else{
      this.getBills();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
