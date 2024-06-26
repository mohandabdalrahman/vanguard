import { Component, OnInit, ViewChild } from "@angular/core";
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
import { UserRole, UserRoleGridData } from "../user-role.model";
import { UserRolesService } from "../user-role.service";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-user-roles",
  templateUrl: "./list-user-roles.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-user-roles.component.scss",
  ],
})
export class ListUserRolesComponent implements OnInit {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentLang: string;
  gridData: UserRoleGridData[] = [];
  colData: ColData[] = [];
  userRoles: UserRole[] = [];
  userRoleId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private userRoleService: UserRolesService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private queryParamsService : QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.userRoles);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.userRoleId = id;
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
          this.getUserRoles();
        }
      }),
    );
    this.getUserRoles();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "userRole.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "userRole.enName" : "userRole.localeName"}`,
      },
      { field: "description", header: "app.description" },
      { field: "systemType", header: "userRole.systemType" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: UserRole[]) {
    this.gridData = data.map((userRole) => {
      return {
        id: userRole.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? userRole.enName : userRole.localeName,
        description: userRole.description,
        systemType: "app.systemType." + userRole.systemType,
        status: !userRole.suspended ? "active" : "inactive",
      };
    });
  }

  getUserRoles(searchObj?: AdvanceSearch) {
    
    this.subs.add(
      this.userRoleService
        .getUserRoles(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (userRoles: BaseResponse<UserRole>) => {
            if (userRoles?.content?.length) {
              this.totalElements = userRoles.totalElements;
              this.userRoles = userRoles.content;
              this.setGridData(this.userRoles);
            } else {
              this.userRoles = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noRolesFound", "type.warning"])
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

  deleteUserRole() {
    
    this.subs.add(
      this.userRoleService.deleteUserRole(this.userRoleId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getUserRoles();
          
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
      this.getUserRoles(this.submitForm?.value);
    }else{
      this.getUserRoles();
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getUserRoles(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
