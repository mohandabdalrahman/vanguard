import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {BaseResponse} from "@models/response.model";
import {User, UserGridData, UserSearchObj} from "@models/user.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {AdminUserService} from "../admin-user.service";
import {SortView} from "@models/sort-view.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-users",
  templateUrl: "./list-users.component.html",
  styleUrls: ["../../../scss/list.style.scss", "./list-users.component.scss"],
})
export class ListUsersComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentLang: string;
  gridData: UserGridData[] = [];
  colData: any[] = [];
  adminUsers: User[] = [];
  adminUserId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private adminUserService: AdminUserService,
    
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
        this.setGridData(this.adminUsers);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.adminUserId = id;
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
          this.getAdminUsers();
        }
      }),
    );
    this.getAdminUsers();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "user.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "user.enName" : "user.localeName"}`,
        sortable: false
      },
      { field: "username", header: "app.username" },
      { field: "email", header: "app.email" },

      { field: "userRole", header: "user.userRole", sortable: false },
      { field: "mobileNumber", header: "user.mobileNumber" },
      { field: "status", header: "user.status" },
    ];
  }

  setGridData(data: User[]) {
    this.gridData = data.map((adminUser) => {
      return {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? adminUser.enName : adminUser.localeName,
        userRole: adminUser.roles
          .map((role) => {
            return this.currentLang === 'en' ? role.enName : role.localeName;
          })
          .join(", "),
        mobileNumber: adminUser.mobileNumber,
        status: !adminUser.suspended ? "active" : "inactive",
      };
    });
  }

  getAdminUsers(searchObj?: UserSearchObj) {
    
    this.subs.add(
      this.adminUserService
        .getAdminUsers(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (adminUsers: BaseResponse<User>) => {
            if (adminUsers.content?.length > 0) {
              this.totalElements = adminUsers.totalElements;
              this.adminUsers = adminUsers.content;
              this.setGridData(this.adminUsers);
            } else {
              this.adminUsers = [];
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

  deleteAdminUser() {
    
    this.subs.add(
      this.adminUserService.deleteAdminUser(this.adminUserId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getAdminUsers();
          
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
      this.getAdminUsers(this.submitForm?.value);
    }else{
      this.getAdminUsers();
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination()
  }

  handleSearch() {
    this.currentPage = 1;
    this.getAdminUsers(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
