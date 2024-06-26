import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {User, UserGridData, UserSearchObj} from "@models/user.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {UserRole} from "../../user-roles/user-role.model";
import {UserRolesService} from "../../user-roles/user-role.service";
import {CorporateUserService} from "../corporate-user.service";
import {SortView} from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";
import {OuNode} from "@models/ou-node.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";

@Component({
  selector: "app-list-corporate-user",
  templateUrl: "./list-corporate-user.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-user.component.scss",
  ],
})
export class ListCorporateUserComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;

  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: UserGridData[] = [];
  colData: ColData[] = [];
  corporateUsers: User[] = [];
  corporateUserId: number;
  currentPage: number = 1;
  totalElements: number;
  userRoles: UserRole[] = [];
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  ouIds: number | number[] = null;
  destroyed = new Subject<any>();
  showCreateBtn: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private userRoleService: UserRolesService,
    private queryParamsService: QueryParamsService,
    public router: Router,
    public corporateOuService: CorporateOuService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.corporateUsers);
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      })
    );
    this.subs.add(
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getCorporateUsers(this.corporateId);
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
       if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        }
        else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details'))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.route.parent.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouIds = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
          this.getCorporateUsers(this.corporateId);
        }
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateUserId = id;
        this.deleteModalComponent.open();
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin' && this.authService.isAdminCorporateOuEnabled()) {
          this.showCreateBtn = (Number(this.authService.getStoredSelectedOuNodeId()) && this.authService.getStoredSelectedOuNodeId() !== 0);
          this.ouIds = this.authService.getStoredSelectedOuNodeId()  || ids.slice(0, OU_IDS_LENGTH);
          this.getCorporateUsers(this.corporateId);
        }
      })
    );
    if (!this.authService.isAdminCorporateOuEnabled() && !this.authService.isOuEnabled()) {
      this.getCorporateUsers(this.corporateId);
    }
    this.getUserRoles();
  }

  setColData(lang: string) {
    this.colData = [
      {field: "id", header: "user.id"},
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "user.enName" : "user.localeName"}`,
        sortable: false
      },
      {field: "username", header: "app.username"},
      {field: "email", header: "app.email"},

      {field: "userRole", header: "user.userRole", sortable: false},
      {field: "mobileNumber", header: "user.mobileNumber"},
      {field: "status", header: "user.status"},
    ];
    if ((this.corporateOuService.getOuTabsStatus() && ((this.ouIds as number[])?.length > 1)) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || ((this.ouIds as number[])?.length > 1)))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "user.ouName", sortable: false});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }

  setGridData(data: User[]) {
    this.gridData = data.map((corporateUser) => {
      return {
        id: corporateUser.id,
        username: corporateUser.username,
        email: corporateUser.email,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? corporateUser.enName
            : corporateUser.localeName,
        userRole: corporateUser.roles
          .map((role) => {
            return this.currentLang === "en"
              ? role?.enName ?? ""
              : ((role?.localeName ?? "") as string);
          })
          .join(", "),
        mobileNumber: corporateUser.mobileNumber,
        ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateUser.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateUser.ouId)?.localName ?? "",
        status: !corporateUser.suspended ? "active" : "inactive",
      };
    });
  }

  getCorporateUsers(corporateId: number, searchObj?: UserSearchObj) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(
          corporateId,
          removeNullProps({
            ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
            ...searchObj,
          }),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          async (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              const ouIds = [];
              this.totalElements = corporateUsers.totalElements;
              this.corporateUsers = corporateUsers.content;
              if (this.corporateOuService.getOuTabsStatus() && ((this.ouIds as number[])?.length > 1) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || ((this.ouIds as number[])?.length > 1)))) {
                this.corporateUsers.forEach((corporateUser) => {
                  if (corporateUser.ouId) {
                    ouIds.push(corporateUser.ouId);
                  }
                });
                const uniqueOuIds = [...new Set(ouIds)];
                try {
                  await this.corporateOuService.fetchOuList(this.corporateId, {ouIds: uniqueOuIds})
                } catch (err) {
                  this.errorService.handleErrorResponse(err);
                }
              }
              this.setGridData(corporateUsers.content);
            } else {
              this.corporateUsers = [];
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

  deleteCorporateUser() {
    
    this.subs.add(
      this.corporateUserService
        .deleteCorporateUser(this.corporateId, this.corporateUserId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporateUsers(this.corporateId);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getUserRoles() {
    
    this.subs.add(
      this.userRoleService.getUserRoles().subscribe(
        (userRoles: BaseResponse<UserRole>) => {
          if (userRoles?.content?.length) {
            this.userRoles = userRoles.content;
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
      this.getCorporateUsers(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateUsers(this.corporateId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporateUsers(this.corporateId, this.submitForm?.value);
  }

  selectOu(ouNode: OuNode) {
    if (ouNode?.id !== null) {
      this.submitForm?.reset();
      if (ouNode.id === 0) {
        this.showCreateBtn = false;
        this.ouIds = this.ouTabsComponent.ouNodes.filter(node => node.id !== 0).map(node => node.id).slice(0, OU_IDS_LENGTH);
      } else {
        this.showCreateBtn = true;
        this.ouIds = ouNode.id;
      }
      this.setColData(this.currentLang)
      this.getCorporateUsers(this.corporateId)
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
