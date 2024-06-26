import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetPolicy} from "@models/asset-policy.model";
import {AssetTag} from "@models/asset-tag";
import {AssetType} from "@models/asset-type";
import {ColData} from "@models/column-data.model";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {NfcTag} from "@models/nfc-tag.model";
import {Policy, PolicyType} from "@models/policy.model";
import {BaseResponse} from "@models/response.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {NfcTagService} from "@shared/services/nfc-tag.service";
import {PolicyService} from "@shared/services/policy.service";
import {DeleteModalComponent} from "@theme/components";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {
  OverwriteConfirmModalComponent
} from "@theme/components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import {Country} from "app/admin/countries/country.model";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {
  CorporateVehicle,
  FuelType,
  VehicleType,
} from "../corporate-vehicle.model";
import {CorporateVehicleService} from "../corporate-vehicle.service";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {User} from "@models/user.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {OuNode} from "@models/ou-node.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";
import {MenuItem} from "@services/pages-menu/pages-menu.service";
import {NbMenuService} from "@nebular/theme";

@Component({
  selector: "app-list-corporate-vehicles",
  templateUrl: "./list-corporate-vehicles.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-vehicles.component.scss",
  ],
})
export class ListCorporateVehiclesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("assignPolicyModal") private assignPolicyModal: ModalComponent;
  @ViewChild("overwritePolicy")
  private overwritePolicyModal: OverwriteConfirmModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;

  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: any[] = [];
  testData: any[] = [];
  assetTags: AssetTag[] = [];
  policies: Policy[] = [];
  corporateUsers: User[] = [];
  colData: ColData[] = [];
  corporateVehicles: CorporateVehicle[] = [];
  corporateVehicleId: number;
  assignedPolicy: number[] = [];
  AssetPolicyVehicle: AssetPolicy;
  showAssignPolicyBtn: boolean = false;
  selectedVehiclesArr: CorporateVehicle[] = [];
  selectedPolicyIds: number[] = [];
  currentPage: number = 1;
  totalElements: number;
  vehicleTypes: VehicleType[] = [];
  fuelTypes: FuelType[] = Object.keys(FuelType).map((key) => FuelType[key]);
  fuelTypesTranslation = [];
  vehicleFuelTypes = new Map();
  countries: Country[];
  nfcTags: NfcTag[];
  pageSize = 10;
  ouIds: number | number[] = null;
  destroyed = new Subject<any>();
  showCreateBtn: boolean = true;
  counter = 0
  menu: MenuItem[] = [
    {title: 'repeated/one-time', key: "repeated/one-time", icon: 'sync-outline'},
    {
      title: 'daily-running',
      key: "daily-running",
      icon: 'clock-outline',
    },
  ];
  isRepeatedPolicy = false;

  constructor(
    private route: ActivatedRoute,
    private corporateVehicleService: CorporateVehicleService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private policyService: PolicyService,
    private corporateUserService: CorporateUserService,
    private translate: TranslateService,
    private emitService: EmitService,
    private modalService: NgbModal,
    private nfcTagService: NfcTagService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    public router: Router,
    public corporateOuService: CorporateOuService,
    public authService: AuthService,
    private nbMenuService: NbMenuService
  ) {
  }

  ngOnInit(): void {
    this.menu[1].link = this.router.url + '/assign-daily-policy';
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData();
        this.gridData = [];
        this.setGridData(this.corporateVehicles);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouIds = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
          this.getCorporateVehicles(this.corporateId);
        }
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateVehicleId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getCorporateVehicles(this.corporateId);
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
        if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        } else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details') || event['url'].includes(('assign-daily-policy')))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin' && this.authService.isAdminCorporateOuEnabled()) {
          this.showCreateBtn = (Number(this.authService.getStoredSelectedOuNodeId()) && this.authService.getStoredSelectedOuNodeId() !== 0);
          this.ouIds = this.authService.getStoredSelectedOuNodeId() || ids.slice(0, OU_IDS_LENGTH);
          this.getCorporateVehicles(this.corporateId);
        }
      }),
      this.nbMenuService.onItemClick().subscribe(({item}) => {
        if (item['key'] === 'repeated/one-time') {
          this.isRepeatedPolicy = true
        }
      })
    );

    this.fuelTypesTranslation = this.fuelTypes.map((element => {
      return $localize`fuelType.` + element
    }))
    for (let i = 0; i < this.fuelTypes.length; i++) {
      this.vehicleFuelTypes.set(this.fuelTypes[i], this.fuelTypesTranslation[i]);
    }

    this.getCorporateNfc();
    this.getPolicies(this.corporateId, AssetType.Vehicle, this.authService.getStoredSelectedOuNodeId());
    if (this.corporateId) {
      this.getAssetTags(this.corporateId);
      this.getCorporateUsers(this.corporateId);
    }
    if (!this.authService.isOuEnabled() && !this.authService.isAdminCorporateOuEnabled()) {
      this.getCorporateVehicles(this.corporateId);
    }
  }

  setColData() {
    this.colData = [
      {field: "status", header: "corporateVehicle.status"},
      {field: "type", header: "corporateVehicle.type"},
      {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
      {field: "fuelType", header: "corporateVehicle.fuelType"},
      {field: "plateNumber", header: "corporateVehicle.plateNumber"},
      {field: "users", header: "user.name"},
    ]
    if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "unit.ouName"});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }

  setGridData(data: CorporateVehicle[]) {
    let vehiclesWithoutUsers = []
    data.forEach(async (corporateVehicle) => {
      const corporateVehicleData = {
        id: corporateVehicle.id,
        status: !corporateVehicle.suspended ? "active" : "inactive",
        type:
          this.currentLang === "en"
            ? this.vehicleTypes.find(
            (vehicleType) =>
              vehicleType.id === corporateVehicle.vehicleTypeId
          )?.enName ?? ""
            : this.vehicleTypes.find(
            (vehicleType) =>
              vehicleType.id === corporateVehicle.vehicleTypeId
          )?.localeName ?? "",
        fuelType: $localize`fuelType.` + corporateVehicle.fuelType,
        plateNumber: corporateVehicle.plateNumber,
        ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateVehicle.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateVehicle.ouId)?.localName ?? "",
        vehicleCode: corporateVehicle.vehicleCode,
      };

      if (corporateVehicle?.authorizedUserIds?.length > 0) {
        this.subs.add(
          this.corporateUserService
            .getCorporateUsers(this.corporateId, {
              userIds: corporateVehicle.authorizedUserIds,
            })
            .subscribe(
              (corporateUsers) => {
                if (corporateUsers) {
                  this.gridData.push({
                    ...corporateVehicleData,
                    users: corporateUsers.content
                      .map((user) =>
                        this.currentLang === "en"
                          ? user.enName
                          : user.localeName
                      )
                      .join(","),
                  });
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
                
              },
              (err) => {
                this.errorService.handleErrorResponse(err);
              }
            )
        );

      } else {
        vehiclesWithoutUsers.push(corporateVehicleData);
      }
    });
    setTimeout(() => {
      this.gridData = [...this.gridData, ...vehiclesWithoutUsers]
    }, 2000)
  }

  getCorporateVehicles(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Vehicle>
  ) {
    
    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicles(
          corporateId,
          removeNullProps({
            ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
            ...searchObj,
          }),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          async (corporateVehicles: BaseResponse<CorporateVehicle>) => {
            this.gridData = [];
            const ouIds = [];
            if (corporateVehicles.content?.length > 0) {
              this.totalElements = corporateVehicles.totalElements;
              this.corporateVehicles = corporateVehicles.content;
              if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
                this.corporateVehicles.forEach((corporateVehicle) => {
                  if (corporateVehicle.ouId) {
                    ouIds.push(corporateVehicle.ouId);
                  }
                })
                const uniqueOuIds = [...new Set(ouIds)];
                try {
                  await this.corporateOuService.fetchOuList(this.corporateId, {ouIds: uniqueOuIds});
                } catch (error) {
                  this.errorService.handleErrorResponse(error);
                }

              }
              this.getVehicleTypes();
            } else {
              this.corporateVehicles = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noVehiclesFound", "type.warning"])
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

  getAssetTags(corporateId: number) {
    
    this.subs.add(
      this.assetTagService.getAssetTags(corporateId).subscribe(
        (assetTags: BaseResponse<AssetTag>) => {
          if (assetTags.content?.length > 0) {
            this.assetTags = assetTags.content;
          } else {
            //this.toastr.warning("No asset tags found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getPolicies(corporateId: number, assetType: AssetType, ouId?: number) {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(corporateId, ouId !=0 && ouId !== undefined? {assetType, isExpired: false, suspended: false, ouIds: [ouId]} : {assetType, isExpired: false, suspended: false})
        .subscribe(
          (policies: Policy[]) => {
            if (policies["content"]?.length > 0) {
              this.policies = policies["content"].filter((policy: { policyType: string; }) => policy.policyType != PolicyType.dynamic);
            } else {
              this.translate
                .get(["error.noPoliciesFound", "type.warning"])
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

  getCorporateUsers(corporateId: number) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(corporateId, {suspended: false})
        .subscribe(
          (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content;
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
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  onItemSelect(selectedItems: number[]) {
    const selectedVehicles = this.corporateVehicles.filter((vehicle) => {
      return selectedItems.includes(vehicle.id);
    });
    this.selectedVehiclesArr = Object.assign([], selectedVehicles);
    this.showAssignPolicyBtn = this.selectedVehiclesArr?.length > 0;
  }

  getVehicleTypes() {
    
    this.subs.add(
      this.corporateVehicleService
        .getVehicleTypes({suspended: false})
        .subscribe(
          (vehicleTypes: BaseResponse<VehicleType>) => {
            if (vehicleTypes.content?.length > 0) {
              this.vehicleTypes = vehicleTypes.content;
              this.setGridData(this.corporateVehicles);
            } else {
              this.translate
                .get(["error.noVehicleTypesFound", "type.warning"])
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

  getCorporateNfc() {
    
    this.subs.add(
      this.nfcTagService.getNfcTags(this.corporateId).subscribe(
        (nfcTag: BaseResponse<NfcTag>) => {
          if (nfcTag.content) {
            this.nfcTags = nfcTag.content;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  deleteCorporateVehicle() {
    
    this.subs.add(
      this.corporateVehicleService
        .deleteCorporateVehicle(this.corporateId, this.corporateVehicleId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporateVehicles(this.corporateId);
            
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
      this.getCorporateVehicles(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateVehicles(this.corporateId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    if (this.submitForm?.value) {
      this.getCorporateVehicles(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateVehicles(this.corporateId);
    }
  }


  selectOu(ouNode: OuNode) {
    if (ouNode?.id !== null) {
      this.submitForm?.reset();
      if (ouNode.id == 0) {
        this.showCreateBtn = false;
        this.ouIds = this.ouTabsComponent.ouNodes.filter(node => node.id !== 0).map(node => node.id).slice(0, OU_IDS_LENGTH);
      } else {
        this.showCreateBtn = true;
        this.ouIds = ouNode.id;
      }
      this.setColData()
      this.getCorporateVehicles(this.corporateId);
      this.getPolicies(this.corporateId, AssetType.Vehicle, this.authService.getStoredSelectedOuNodeId());
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  openAssignPolicy() {
    this.assignPolicyModal.open();
  }

  assignPolicy() {
    let showAlert = false;
    let selectedPolicy: any = this.policies.filter((policy) => {
      if (this.assignedPolicy?.includes(policy.id)) {
        return policy;
      }
    });
    this.selectedVehiclesArr.forEach((vehicle) => {
      if (vehicle.assetPolicies.length > 0) {
        vehicle.assetPolicies.forEach((policy) => {
          selectedPolicy.forEach((selected) => {
            if (policy.productCategoryId == selected.productCategoryId) {
              showAlert = true;
              return;
            }
          });
        });
      }
    });
    this.selectedPolicyIds = selectedPolicy.map((policy) => policy.id);
    if (showAlert) {
      this.assignPolicyModal.closeModal();
      this.overwritePolicyModal.open();
    } else {
      this.AssignPolicyForCorporateVehicle(false);
    }
  }

  AssignPolicyForCorporateVehicle(policyOverwrite) {
    let vehicles: number[] = [];
    vehicles = this.selectedVehiclesArr.map((vehicle) => {
      return vehicle.id;
    });
    let assignedPolicyAsset = {
      assetIds: vehicles,
      policyIds: this.selectedPolicyIds,
      assetType: AssetType.Vehicle,
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
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          },
          () => {
            this.selectedPolicyIds = null;
            this.overwritePolicyModal.closeModal();
          }
        )
    );
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
