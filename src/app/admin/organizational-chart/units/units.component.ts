import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {OuNode, OuTreeNode} from "../corporate-ou.model";
import {ContextMenu} from "@theme/components/context-menu/context-menu.model";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../../auth/auth.service";
import {ErrorService} from "@shared/services/error.service";
import {CorporateOuService} from "../corporate-ou.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {AssetPolicyService} from "@shared/services/asset-policy.service";
import {AssetType} from "@models/asset-type";
import {RoleTag} from "../../user-roles/user-role.model";
import {OuRoleUserNamesDto} from "@models/user.model";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: "app-units",
  templateUrl: "./units.component.html",
  styleUrls: ["./units.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class UnitsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("adminUsersModal") private adminUsersModal: ModalComponent;

  items: ContextMenu[] = [
    {
      title: "details",
      icon: "icons-view",
      hasClickAction: true,
      role: "OU_VIEW",
    },
    {
      title: "edit",
      icon: "icons-edit",
      path: "update",
      role: "OU_UPDATE",
      isRelative: true,
    },
    {
      title: "addUnit",
      icon: "icons-add",
      path: "create",
      isRelative: true,
      role: "OU_CREATE",
    },
    // {
    //   title: 'addPolicy',
    //   icon: 'icons-policies',
    //   path: 'add-policy',
    //   role: 'POLICY_CREATE'
    // },
    // {
    //   title: 'addVehicle',
    //   icon: 'icons-truck-merchants',
    //   path: 'add-vehicle',
    //   role: 'ASSET_CREATE'
    // },
    // {
    //   title: 'addCardHolder',
    //   icon: 'icons-user-card',
    //   path: 'add-cardHolder',
    //   role: 'CORPORATE_USER_CREATE'
    // },
    // {
    //   title: 'addEquipment',
    //   icon: 'icons-equipment',
    //   path: 'add-equipment',
    //   role: 'ASSET_CREATE'
    // }
  ];
  currentLang: string;
  ouId: number;
  corporateId: number;
  ouTreeIds: number[] | any;
  userCountsMap = new Map<number, number>();
  assetCountsMap = new Map<number, any>();
  corporateOuUsersMap = new Map<number, OuRoleUserNamesDto[]>();
  userType: string;

  constructor(
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private authService: AuthService,
    private errorService: ErrorService,
    private corporateOuService: CorporateOuService,
    private corporateUserService: CorporateUserService,
    private assetPolicyService: AssetPolicyService,
    private route: ActivatedRoute
  ) {
  }

  tree = new OuTreeNode();
  restAdminUsers: OuRoleUserNamesDto[] = [];
  showLoading = true;

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.ouId = this.userType === 'admin' ? this.authService.getRootOuId() : this.authService.getOuId();
    this.ouTreeIds = this.userType === 'corporate' ? this.authService.getOuTreeIds()?.split(",")?.map(Number) : null;
    this.corporateId = +getRelatedSystemId(null, "corporateId");

    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.corporateOuService.restAdminUsers$.subscribe((restAdminUsers) => {
        this.showRestAdminUsers(restAdminUsers);
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    );
    this.getCorporateOuHierarchy();
    if (this.userType === 'corporate' && this.ouTreeIds?.length) {
      this.fetchCorporateAssets();
    }

  }

  ngAfterViewInit(time = 2500): void {
    setTimeout(() => {
      const orgChartHeight = (
        document.querySelector(".ng13-org-chart-container") as HTMLDivElement
      )?.getBoundingClientRect().height;
      const orgChartWidth = (
        document.querySelector("angular-org-chart") as HTMLDivElement
      )?.getBoundingClientRect().width;
      const unitsContainer = document.querySelector(
        "#units-container"
      ) as HTMLDivElement;
      if (unitsContainer) {
        unitsContainer.style.height = orgChartHeight + 50 + "px";
        unitsContainer.style.width = orgChartWidth + 100 + "px";
        this.showLoading = false;
      }
    }, time);
  }


  fetchCorporateAssets() {
    this.getCorporatesUsersCount();
    this.getCorporateAssetCount();
    this.getCorporateOuAdmins();
  }

  handleCollapse(node: OuNode) {
    node.hideChildren = !node.hideChildren;
    this.ngAfterViewInit(0)
  }

  getCorporateOuHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (corporateOus) => {
            if (corporateOus) {
              this.ouTreeIds = corporateOus?.children?.map((child) => child.id);
              this.ouTreeIds.unshift(corporateOus['id']);
              if (this.ouTreeIds?.length) {
                this.fetchCorporateAssets();
              }
              this.corporateOuService.onFetchCorporateOus(corporateOus);
              corporateOus.cssClass = "rootLevel";
              if (corporateOus?.children?.length === 0) {
                corporateOus.cssClass = "rootLevel hasNoChildren";
              }
              corporateOus.children.forEach((child) => {
                child.cssClass = "firstLevel";
                child.hideChildren = true;
              });
              this.tree = corporateOus;
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporatesUsersCount(): void {
    this.subs.add(
      this.corporateUserService
        .getCorporatesUsersCount(this.corporateId, {
          ouIds: this.ouTreeIds,
        })
        .subscribe(
          (userCounts) => {
            if (userCounts.length) {
              userCounts.forEach((obj) => {
                this.userCountsMap.set(obj.ouId, obj.count);
              });
              this.corporateOuService.setUserCountsMap(this.userCountsMap);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateAssetCount(): void {
    this.subs.add(
      this.assetPolicyService
        .getCorporateAssetCount(this.corporateId, {
          ouIds: this.ouTreeIds,
          types: ["USER", "VEHICLE"],
        })
        .subscribe(
          (assetCounts) => {
            if (assetCounts.length) {
              assetCounts.forEach((obj) => {
                const assetObj = {
                  [AssetType.User]: obj.assetCounts[AssetType.User],
                  [AssetType.Vehicle]: obj.assetCounts[AssetType.Vehicle],
                };
                this.assetCountsMap.set(obj.ouId, assetObj);
              });
              this.corporateOuService.setAssetCountsMap(this.assetCountsMap);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateOuAdmins(): void {
    this.subs.add(
      this.corporateUserService
        .getCorporateOuAdmins(this.corporateId, RoleTag.OU_ADMIN, {
          ouIds: this.ouTreeIds,
        })
        .subscribe(
          (corporateOuUsers) => {
            if (corporateOuUsers) {
              for (const corporateOuUsersKey in corporateOuUsers) {
                this.corporateOuUsersMap.set(
                  +corporateOuUsersKey,
                  corporateOuUsers[corporateOuUsersKey]
                );
              }
              this.corporateOuService.setAdminUsersMap(
                this.corporateOuUsersMap
              );
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  showRestAdminUsers(restAdminUsers) {
    // remove first user
    this.restAdminUsers = restAdminUsers.slice(1);
    this.adminUsersModal.open();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
