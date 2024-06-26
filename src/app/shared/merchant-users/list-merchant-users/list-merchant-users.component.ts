import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { BaseResponse } from "@models/response.model";
import { UserGridData, UserSearchObj } from "@models/user.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { MerchantUser } from "../merchant-user.model";
import { MerchantUserService } from "../merchant-user.service";
import { SortView } from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-merchant-users",
  templateUrl: "./list-merchant-users.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-merchant-users.component.scss",
  ],
})
export class ListMerchantUsersComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantId: number;
  gridData: UserGridData[] = [];
  currentLang: string;
  colData: ColData[] = [];
  merchantUsers: MerchantUser[] = [];
  merchantUserId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private merchantUserService: MerchantUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
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
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.merchantUsers);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.merchantUserId = id;
        this.deleteModalComponent.open();
      })
    );
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchantUsers(this.merchantId);
        }
      }),
    );
    this.getMerchantUsers(this.merchantId);

  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "user.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "user.enName" : "user.localeName"}`,
        sortable: false,
      },
      { field: "username", header: "app.username" },
      { field: "email", header: "app.email" },
      { field: "userRole", header: "user.userRole", sortable: false },
      { field: "mobileNumber", header: "user.mobileNumber" },
      { field: "status", header: "user.status" },
    ];
  }

  setGridData(data: MerchantUser[]) {
    this.gridData = data.map((merchantUser) => {
      return {
        id: merchantUser.id,
        username: merchantUser.username,
        email: merchantUser.email,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? merchantUser.enName
            : merchantUser.localeName,
        userRole: merchantUser.roles
          .map((role) => {
            return this.currentLang === "en"
              ? role?.enName ?? ""
              : ((role?.localeName ?? "") as string);
          })
          .join(", "),
        mobileNumber: merchantUser.mobileNumber,
        status: !merchantUser.suspended ? "active" : "inactive",
      };
    });
  }

  getMerchantUsers(merchantId: number, searchObj?: UserSearchObj) {
    
    this.subs.add(
      this.merchantUserService
        .getMerchantUsers(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (merchantUsers: BaseResponse<MerchantUser>) => {
            if (merchantUsers.content?.length > 0) {
              this.totalElements = merchantUsers.totalElements;
              this.merchantUsers = merchantUsers.content;
              this.setGridData(this.merchantUsers);
            } else {
              this.merchantUsers = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noUsersFound", "type.warning"])
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

  deleteMerchantUser() {
    
    this.subs.add(
      this.merchantUserService
        .deleteMerchantUser(this.merchantId, this.merchantUserId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getMerchantUsers(this.merchantId);
            
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
      this.getMerchantUsers(this.merchantId, this.submitForm?.value);
    }else{
      this.getMerchantUsers(this.merchantId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantUsers(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
