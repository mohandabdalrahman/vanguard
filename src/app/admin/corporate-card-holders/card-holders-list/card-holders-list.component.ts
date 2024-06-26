import {Component, OnInit, ViewChild} from "@angular/core";
import {BaseResponse} from "@models/response.model";
import {
  OverwriteConfirmModalComponent
} from "@theme/components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {ColData} from "@models/column-data.model";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {Policy} from "@models/policy.model";
import {TranslateService} from "@ngx-translate/core";
import {ErrorService} from "@shared/services/error.service";
import {PolicyService} from "@shared/services/policy.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateVehicleService} from "app/admin/corporate-vehicle/corporate-vehicle.service";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetType} from "@models/asset-type";
import {ModalComponent} from "app/@theme/components/modal/modal.component";
import {NgForm} from "@angular/forms";
import {AssetTag} from "@models/asset-tag";
import {CardHolder, CardHolderGridData} from "@models/card-holder.model";
import {CardHolderService} from "@shared/services/card-holder.service";
import {Card} from "@models/card.model";
import {CorporateUserService} from "app/admin/corporate-user/corporate-user.service";
import {DatePipe} from "@angular/common";
import {CorporateCardService} from "@shared/services/corporate-card.service";
import {forkJoin, Subject} from "rxjs";
import {User} from "@models/user.model";
import {changeCheckboxState} from "@helpers/checkbox-state";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {OuNode} from "@models/ou-node.model";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";

@Component({
  selector: "app-card-holders-list",
  templateUrl: "./card-holders-list.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./card-holders-list.component.scss",
  ],
})
export class CardHoldersListComponent implements OnInit {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("assignPolicy") private assignPolicyModal: ModalComponent;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;
  @ViewChild("overwritePolicy")

  private overwritePolicyModal: OverwriteConfirmModalComponent;
  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: CardHolderGridData[] = [];
  policies: Policy[] = [];
  corporateUsers: CardHolder[] = [];
  // corporates: Corporate[];
  colData: ColData[] = [];
  corporateVehicleId: number;
  showAssignPolicyBtn: boolean = false;
  selectedCardHolders: any[] = [];
  selectedPolicyId: number[] = [];
  currentPage: number = 1;
  totalElements: number;
  cardHolders: any[] = [];
  UsersIds: number[] = [];
  userAssets: CardHolder[] = [];
  assginedPolicy: number = null;
  assetTags: AssetTag[] = [];
  corporateCards: Card[];
  users: User[] = [];
  pageSize = 10;
  // printSelected = false;
  checkedCheckboxes: string[];
  ouIds: number | number[] = null;
  destroyed = new Subject<any>();
  showCreateBtn = false;

  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    private corporateVehicleService: CorporateVehicleService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private policyService: PolicyService,
    private cardHolderService: CardHolderService,
    private translate: TranslateService,
    private corporateCardService: CorporateCardService,
    private currentLangService: CurrentLangService,
    private datePipe: DatePipe,
    private queryParamsService: QueryParamsService,
    private router: Router,
    public corporateOuService: CorporateOuService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.checkedCheckboxes = JSON.parse(
      sessionStorage.getItem("checkedCheckbox")
    );
    this.selectedCardHolders = JSON.parse(
      sessionStorage.getItem("selectedCardHolders")
    );
    this.showAssignPolicyBtn = this.checkedCheckboxes?.length > 0;
    this.setColData();
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.selectCheckboxes();
        this.gridData = [];
        this.setGridData(this.userAssets);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouIds = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
          this.getCardHolders(this.corporateId);
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getCardHolders(this.corporateId);
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
        if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        } else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details'))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin' && this.authService.isAdminCorporateOuEnabled()) {
          this.showCreateBtn = (Number(this.authService.getStoredSelectedOuNodeId()) && this.authService.getStoredSelectedOuNodeId() !== 0);
          this.ouIds = this.authService.getStoredSelectedOuNodeId() || ids.slice(0, OU_IDS_LENGTH);
          this.getCardHolders(this.corporateId);
        }
      })
    );

    if (!this.authService.isOuEnabled() && !this.authService.isAdminCorporateOuEnabled()) {
      this.getCardHolders(this.corporateId);
    }

  }

  getCardHolders(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.User>
  ) {
    
    this.gridData = [];
    this.subs.add(
      this.cardHolderService
        .getCardHolders(
          corporateId,
          removeNullProps({
            ...searchObj,
            ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
          }),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          async (cardHolders) => {
            if (cardHolders.content.length > 0) {
              const ouIds = [];
              this.userAssets = cardHolders.content;
              this.totalElements = cardHolders.totalElements;
              if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
                this.userAssets.forEach((user) => {
                  if (user.ouId) {
                    ouIds.push(user.ouId);
                  }
                });
                const uniqueOuIds = [...new Set(ouIds)];
                try {
                  await this.corporateOuService.fetchOuList(this.corporateId, {ouIds: uniqueOuIds})
                } catch (err) {
                  this.errorService.handleErrorResponse(err);
                }

              }
              this.getCardholderData(this.userAssets);

            } else {
              this.userAssets = [];
              this.gridData = [];
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

  setColData() {
    this.colData = [
      {field: "id", header: "cardHolder.id"},
      {field: "name", header: "cardHolder.name"},
      {field: "serialNumber", header: "cardHolder.serialNumber"},
      {field: "cardExpiry", header: "cardHolder.expiryDate"},
      // { field: "manexGaugeUser", header: "cardHolder.manexGaugeUser" },
      {field: "virtualCardLabel", header: "cardHolder.virtualCardLabel"},
      {field: "userCorporateId", header: "cardHolder.userCorporateId"},
      {field: "assignedPolicy", header: "cardHolder.assignedPolicy"},
      {field: "assetTag", header: "cardHolder.assetTag"},
      {field: "status", header: "cardHolder.status"},
    ];
    if ((this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "user.ouName"});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }

  getCardholderData(data: CardHolder[]) {
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(this.corporateId, removeNullProps({
          userIds: data.map((d) => d.corporateUserId),
          ouIds: this.ouIds ? this.ouIds : null,
        }))
        .subscribe((users) => {
          if (users.content.length > 0) {
            this.users = users.content;
            let nfcIds = users.content.map((u) => u.nfcIds);
            this.subs.add(
              forkJoin([
                this.corporateCardService.getCorporateCards(this.corporateId, {
                  suspended: false,
                  assigned: true,
                  ids: ([] as number[]).concat(...nfcIds),
                }),
                this.policyService.getUnsuspendedPolicies(this.corporateId, {
                  assetType: AssetType.User,
                  isExpired: false,
                  suspended: false,
                }),
                this.assetTagService.getAssetTags(this.corporateId),
              ]).subscribe(([corporateCards, policies, assetTags]) => {
                this.policies = policies["content"];
                this.corporateCards = corporateCards.content;
                this.assetTags = assetTags.content;
                this.setGridData(data);
                this.selectCheckboxes();
              })
            );
          } else {
            this.translate
              .get(["error.noUsersFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
        })
    );
  }

  setGridData(data: CardHolder[]) {
    data.forEach((cardHolder) => {
      let user = this.users.find((u) => u.id == cardHolder.corporateUserId);
      if (user) {
        let cards = this.corporateCards.filter((c) =>
          user.nfcIds.includes(c.id)
        );
        this.gridData.push({
          id: cardHolder.id,
          name:
            this.currentLang === "en"
              ? cardHolder.enName ?? ""
              : cardHolder.localeName ?? "",
          status: !cardHolder.suspended ? "active" : "inactive",
          userCorporateId: cardHolder.corporateUserId,
          assignedPolicy:
            this.currentLang === "en"
              ? this.policies
                .filter((p) =>
                  cardHolder.assetPolicies
                    .map((a) => a.policyId)
                    .includes(p.id)
                )
                .map((p) => p.enName)
                .join(", ")
              : this.policies
                .filter((p) =>
                  cardHolder.assetPolicies
                    .map((a) => a.policyId)
                    .includes(p.id)
                )
                .map((p) => p.localeName)
                .join(", "),
          assetTag: this.assetTags?.find((a) => a.id == cardHolder.assetTagId)
            ?.enName,
          cardExpiry: this.datePipe.transform(
            cards?.find((c) => !c.virtual)?.expirationDate,
            "yyyy-MM-dd"
          ),
          virtualCardLabel: `cardHolder.virtualCard.${
            cards?.find((c) => c.virtual)?.virtual ? true : false
          }`,
          serialNumber:
            cards?.find((c) => !c.virtual) != null
              ? parseInt(cards?.find((c) => !c.virtual).serialNumber, 16)
              : null,
          ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === cardHolder.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === cardHolder.ouId)?.localName ?? "",

        });
      }
    });
  }

  onItemSelect(selectedRecords: CardHolderGridData[]) {
    const cardHoldersIds = selectedRecords?.map((record) => record.id);
    this.selectedCardHolders = this.userAssets.filter((cardHolder) => {
      return cardHoldersIds.includes(cardHolder.id);
    });
    this.showAssignPolicyBtn = this.selectedCardHolders?.length > 0;
    this.checkedCheckboxes = JSON.parse(
      sessionStorage.getItem("checkedCheckbox")
    );
    //   save selected cardholders in session storage
    if (this.selectedCardHolders.length) {
      sessionStorage.setItem(
        "selectedCardHolders",
        JSON.stringify(this.selectedCardHolders)
      );
    }
  }

  selectCheckboxes() {
    setTimeout(() => {
      changeCheckboxState(
        Array.from(document.querySelectorAll("input[type=checkbox]")),
        this.checkedCheckboxes
      );
    }, 1500);
  }

  openAssignPolicy() {
    this.assginedPolicy = null;
    this.assignPolicyModal.open();
  }

  AssignPolicyForCardHolder(policyOverwrite: boolean) {
    let cardholders: number[] = [];
    cardholders = this.selectedCardHolders.map((x) => {
      return x.id;
    });
    let assignedPolicyAsset = {
      assetIds: cardholders,
      policyIds: this.selectedPolicyId,
      assetType: AssetType.User,
    };
    this.subs.add(
      this.corporateVehicleService
        .assignPolicyToCorporateVehicle(
          this.corporateId,
          assignedPolicyAsset,
          policyOverwrite
        )
        .subscribe(
          () => {
            this.translate.get(["success.policyAssigned"]).subscribe((res) => {
              this.toastr.success(Object.values(res)[0] as string);
            });
            this.getCardHolders(this.corporateId);
          },
          (err) => {
            if (err.includes("409")) {
              location.reload();
            }
            this.errorService.handleErrorResponse(err);
          },
          () => {
            this.selectedPolicyId = [];
            this.overwritePolicyModal.closeModal();
          }
        )
    );
  }

  handleAssignPolicy(value) {
    let showAlert = false;
    this.selectedPolicyId = [];
    let selectedPolicy: any = this.policies.filter((policy) => {
      if (policy.id == value) {
        return policy;
      }
    });
    this.selectedCardHolders.forEach((cardHolder) => {
      if (cardHolder?.assetPolicies?.length > 0) {
        cardHolder?.assetPolicies?.forEach((policy) => {
          if (policy.productCategoryId == selectedPolicy[0].productCategoryId) {
            showAlert = true;
            return;
          }
        });
        if (showAlert) {
          return;
        }
      }
    });
    this.selectedPolicyId.push(value);
    if (showAlert) {
      this.assignPolicyModal.closeModal();
      this.overwritePolicyModal.open();
    } else {
      this.AssignPolicyForCardHolder(false);
    }
  }

  getAssetTags(corporateId: number) {
    
    this.subs.add(
      this.assetTagService.getAssetTags(corporateId).subscribe(
        (assetTags: BaseResponse<AssetTag>) => {
          if (assetTags.content?.length > 0) {
            this.assetTags = assetTags.content;
          } else {
            //this. ("No cardholder groups found");
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
      this.getCardHolders(this.corporateId, this.submitForm?.value);
    } else {
      this.getCardHolders(this.corporateId);
    }
    this.selectCheckboxes();
  }

  handleSearch() {
    this.currentPage = 1;
    if (this.submitForm?.value) {
      this.getCardHolders(this.corporateId, this.submitForm?.value);
    } else {
      this.getCardHolders(this.corporateId);
    }
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
      this.setColData();
      this.getCardHolders(this.corporateId);
    }
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
