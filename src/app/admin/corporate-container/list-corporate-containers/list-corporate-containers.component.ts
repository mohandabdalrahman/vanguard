import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetPolicy} from "@models/asset-policy.model";
import {AssetTag} from "@models/asset-tag";
import {AssetType} from "@models/asset-type";
import {CardHolder} from "@models/card-holder.model";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {Policy} from "@models/policy.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {AssetPolicyService} from "@shared/services/asset-policy.service";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {CardHolderService} from "@shared/services/card-holder.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {PolicyService} from "@shared/services/policy.service";
import {DeleteModalComponent} from "@theme/components";
import {ModalComponent} from "app/@theme/components/modal/modal.component";
import {
  OverwriteConfirmModalComponent
} from "app/@theme/components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import {CorporateHardware} from "app/admin/corporate-hardware/corporate-hardware.model";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateContainer, CorporateContainerGridData,} from "../corporate-container.model";
import {CorporateContainerService} from "../corporate-container.service";
import {SortView} from "@models/sort-view.model";

@Component({
  selector: "app-list-corporate-containers",
  templateUrl: "./list-corporate-containers.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-containers.component.scss",
  ],
})
export class ListCorporateContainersComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("assignPolicyModal") private assignPolicyModal: ModalComponent;
  @ViewChild("overwritePolicy")
  private overwritePolicyModal: OverwriteConfirmModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;

   private subs = new SubSink();
  corporateId: number;
  assetTags: AssetTag[] = [];
  policies: Policy[] = [];
  corporateUsers: CardHolder[] = [];
  gridData: CorporateContainerGridData[] = [];
  showAdvanceSearch: boolean;
  corporateContainerId: number;
  colData: any[] = [
    { field: "id", header: "corporateContainer.id" },
    { field: "size", header: "corporateContainer.size" },
    { field: "status", header: "corporateContainer.status" },
  ];
  currentPage: number = 1;
  totalElements: number;
  assignedPolicy: number[] = [];
  AssetPolicyHardware: AssetPolicy;
  showAssignPolicyBtn: boolean = false;
  selectedContainersArr: CorporateHardware[] = [];
  selectedPolicyId: number[] = [];
  corporateContainers: any;
  currentLang: string;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  ouId: number = null;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private policyService: PolicyService,
    private corporateUserService: CardHolderService,
    private corporateContainerService: CorporateContainerService,
    private emitService: EmitService,
    private assetPolicyService: AssetPolicyService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.ouId = params['ouId'];
        this.getCorporateContainers(this.corporateId);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateContainerId = id;
        this.deleteModalComponent.open();
      })
    );
    this.getAssetTags(this.corporateId);
    this.getPolicies(this.corporateId, AssetType.Container);
    this.getCorporateUsers(this.corporateId);
  }

  getCorporateContainers(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Container>
  ) {
    
    this.subs.add(
      this.corporateContainerService
        .getCorporateContainers(
          corporateId,
          removeNullProps({...searchObj, ouIds: this.ouId ? [this.ouId] : null}),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (corporateContainers: BaseResponse<CorporateContainer>) => {
            if (corporateContainers.content?.length > 0) {
              this.corporateContainers = Object.assign(
                [],
                corporateContainers.content
              );
              this.totalElements = corporateContainers.totalElements;
              this.gridData = corporateContainers.content.map(
                (corporateContainer) => {
                  return {
                    id: corporateContainer.id,
                    size: corporateContainer.size,
                    status: !corporateContainer.suspended
                      ? "active"
                      : "inactive",
                  };
                }
              );
            } else {
              this.totalElements = 0;
              this.gridData = [];
              this.translate
                .get(["error.noContainersFound", "type.warning"])
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

  getPolicies(corporateId: number, assetType: AssetType) {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(corporateId, {assetType})
        .subscribe(
          (policies: Policy[]) => {
            if (policies['content']?.length > 0) {
              this.policies = policies['content'];
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
      this.corporateUserService.getCardHolders(corporateId).subscribe(
        (corporateUsers: BaseResponse<CardHolder>) => {
          if (corporateUsers.content?.length > 0) {
            this.corporateUsers = corporateUsers.content;
          } else {
            this.translate
              .get(["error.noCardHolders", "type.warning"])
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
    this.selectedContainersArr.forEach((vehicle) => {
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
    this.selectedPolicyId = selectedPolicy.map((policy) => policy.id);
    if (showAlert) {
      this.assignPolicyModal.closeModal();
      this.overwritePolicyModal.open();
    } else {
      this.AssignPolicyForCorporateContainer(false);
    }
  }

  AssignPolicyForCorporateContainer(policyOverwrite) {
    let containers: number[] = [];
    containers = this.selectedContainersArr.map((container) => {
      return container.id;
    });
    let assignedPolicyAsset = {
      assetIds: containers,
      policyIds: this.selectedPolicyId,
      assetType: AssetType.Container,
    };
    this.subs.add(
      this.assetPolicyService
        .updateAssetPolicy(
          this.corporateId,
          policyOverwrite,
          assignedPolicyAsset
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
            this.selectedPolicyId = null;
            this.overwritePolicyModal.closeModal();
          }
        )
    );
  }

  onItemSelect(selectedItems: number[]) {
    const selectedVehicles = this.corporateContainers.filter((container) => {
      return selectedItems.includes(container.id);
    });
    this.selectedContainersArr = Object.assign([], selectedVehicles);
    if (this.selectedContainersArr?.length > 0) {
      this.showAssignPolicyBtn = true;
    } else {
      this.showAssignPolicyBtn = false;
    }
  }

  deleteCorporateContainer() {
    
    this.subs.add(
      this.corporateContainerService
        .deleteCorporateContainer(this.corporateId, this.corporateContainerId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporateContainers(this.corporateId);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.handlePagination()
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.handlePagination()
  }

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getCorporateContainers(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateContainers(this.corporateId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination()
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporateContainers(this.corporateId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
