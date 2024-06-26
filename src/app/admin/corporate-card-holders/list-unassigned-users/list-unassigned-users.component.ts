import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { changeCheckboxState } from "@helpers/checkbox-state";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AssignCard, NfcType } from "@models/card.model";
import { ColData } from "@models/column-data.model";
import { UnassignedUser } from "@models/user.model";
import { TranslateService } from "@ngx-translate/core";
import { CorporateCardService } from "@shared/services/corporate-card.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { CorporateUserService } from "app/admin/corporate-user/corporate-user.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { AuthService } from "../../../auth/auth.service";
import {QueryParamsService} from "@shared/services/query-params.service";

@Component({
  selector: "app-list-unassigned-users",
  templateUrl: "./list-unassigned-users.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-unassigned-users.component.scss",
  ],
})
export class ListUnassignedUsersComponent implements OnInit, OnDestroy {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  private subs = new SubSink();
  colData: ColData[] = [];
  unAssignedUsers: UnassignedUser[] = [];
  selectedUnAssignedUsers: UnassignedUser[] = [];
  gridData = [];
  corporateId: number;
  currentLang: string;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  cards: AssignCard[] = [];
  userType: string;
  hasVirtualCard: Boolean = false;
  hasPhysicalCard: Boolean = false;
  userCardType: Boolean;
  checkedCheckboxes: string[];
  isTabView = false;
  detailsUrl: string;
  ouId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private corporateUserService: CorporateUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private corporateCardService: CorporateCardService,
    private authService: AuthService,
    private queryParamsService: QueryParamsService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"];
    if (this.isTabView) {
      const lastIndex = -1;
      this.detailsUrl = this.router.url
        .split("/")
        .slice(0, lastIndex)
        .join("/");
    }
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.selectCheckboxes();
        this.setColData(this.currentLang);
        this.setGridData(this.unAssignedUsers);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.ouId = params["ouId"];
        this.getUnassignedUsers();
      })
    );
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "user.id" },
      {
        field: "corporateUserId",
        header: "cardHolder.corporateUserId",
      },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "user.enName" : "user.localeName"}`,
      },
      { field: "username", header: "cardHolder.username" },
      {
        field: "checkbox",
        header: "cardHolder.setVirtualCard",
        sortable: false,
      },
      // {field: "checkbox", header: "cardHolder.setPrintCard", sortable: false},
    ];
  }

  setGridData(data: UnassignedUser[]) {
    this.gridData = data.map((unAssignedUser) => {
      return {
        id: unAssignedUser.id,
        corporateUserId: unAssignedUser.corporateUserId,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? unAssignedUser.enName
            : unAssignedUser.localeName,
        username: unAssignedUser.username,
        userCardType: unAssignedUser.virtualCard,
      };
    });
  }

  getUnassignedUsers(searchObj?: {
    username?: string;
    mobileNumber?: number;
    virtualCard?: Boolean;
  }) {
    
    this.subs.add(
      this.corporateUserService
        .getUnassignedUsers(
          this.corporateId,
          { ...searchObj, ...(this.ouId && { ouId: this.ouId }) },
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (unAssignedUsers) => {
            if (unAssignedUsers.content.length > 0) {
              this.unAssignedUsers = unAssignedUsers.content;
              this.totalElements = unAssignedUsers.totalElements;
              this.setGridData(this.unAssignedUsers);
            } else {
              this.gridData = [];
              this.setGridData([]);
              this.translate
                .get(["error.noDataFound", "type.warning"])
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

  onItemSelect(selectedItems: number[]) {
    this.selectedUnAssignedUsers = this.unAssignedUsers.filter(
      (unAssignedUser) => {
        return selectedItems.includes(unAssignedUser.id);
      }
    );
  }

  assignCard() {
    if (this.selectedUnAssignedUsers.length) {
      this.cards = this.selectedUnAssignedUsers.map((user) => {
        return {
          userId: user.id,
          userLocalName: user?.localeName,
          userEnName: user?.enName,
          userEmail: user?.email,
          userMobileNumber: user?.mobileNumber,
          relatedSystemId: this.corporateId,
          nfcType: NfcType.CARD,
          virtual: true,
          reissue: false,
        };
      });
      
      this.subs.add(
        this.corporateCardService
          .assignCardToUnassignedUser(this.cards)
          .subscribe(
            () => {
              this.translate.get("success.cardAssigned").subscribe((res) => {
                this.handleSuccessResponse(res);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    }
  }

  // switchPhysicalToggle() {
  //   this.hasPhysicalCard = false
  // }

  switchVirtualToggle() {
    this.hasVirtualCard = false;
  }

  handleSearch() {
    delete this.submitForm.value.physicalCard;
    this.currentPage = 1;

    if (!this.hasVirtualCard && !this.hasPhysicalCard) {
      delete this.submitForm.value.virtualCard;
    } else if (this.hasVirtualCard && !this.hasPhysicalCard) {
      this.submitForm.value.virtualCard = true;
    } else if (!this.hasVirtualCard && this.hasPhysicalCard) {
      this.submitForm.value.virtualCard = false;
    }
    // this.submitForm.value.virtualCard=false
    this.getUnassignedUsers(this.submitForm?.value);
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

  selectCheckboxes() {
    setTimeout(() => {
      changeCheckboxState(
        Array.from(document.querySelectorAll("input[type=checkbox]")),
        this.checkedCheckboxes
      );
    }, 1500);
  }

  handlePagination() {
    this.getUnassignedUsers();
    this.selectCheckboxes();
  }

  handleSuccessResponse(msg: string) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "card-holders",
      ]);
    } else {
      this.router.navigate(
        this.isTabView ? [this.detailsUrl] : ["/corporate", "card-holder"]
      );
    }
    this.toastr.success(msg);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
