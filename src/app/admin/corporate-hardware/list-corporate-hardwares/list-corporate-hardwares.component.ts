import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetPolicy} from "@models/asset-policy.model";
import {AssetTag} from "@models/asset-tag";
import {AssetType} from "@models/asset-type";
import {CardHolder} from "@models/card-holder.model";
import {ColData} from "@models/column-data.model";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {Policy} from "@models/policy.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {CardHolderService} from "@shared/services/card-holder.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {PolicyService} from "@shared/services/policy.service";
import {ModalComponent} from "app/@theme/components/modal/modal.component";
import {
  OverwriteConfirmModalComponent
} from "app/@theme/components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {CorporateHardware} from "../corporate-hardware.model";
import {CorporateHardwareService} from "../corporate-hardware.service";
import {SortView} from "@models/sort-view.model";

@Component({
  selector: "app-list-corporate-hardwares",
  templateUrl: "./list-corporate-hardwares.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-hardwares.component.scss",
  ],
})
export class ListCorporateHardwaresComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("assignPolicyModal") private assignPolicyModal: ModalComponent;
  @ViewChild("overwritePolicy")
  private overwritePolicyModal: OverwriteConfirmModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;

  private subs = new SubSink();
  corporateId: number;
  assetTags: AssetTag[] = [];
  corporateUsers: CardHolder[] = [];
  policies: Policy[] = [];
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  corporateHardwares: CorporateHardware[] = [];
  showAdvanceSearch: boolean;
  corporateHardwareId: number;
  currentPage: number = 1;
  totalElements: number;
  assignedPolicy: number[] = [];
  AssetPolicyHardware: AssetPolicy;
  showAssignPolicyBtn: boolean = false;
  selectedHardwareArr: CorporateHardware[] = [];
  selectedPolicyId: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  ouId: number = null;

  constructor(
    private route: ActivatedRoute,
    private corporateHardwareService: CorporateHardwareService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private corporateUserService: CardHolderService,
    private policyService: PolicyService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.corporateHardwares);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.ouId = params['ouId'];
        this.getCorporateHardwares(this.corporateId);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateHardwareId = id;
        this.deleteModalComponent.open();
      })
    );
    this.getAssetTags(this.corporateId);
    this.getCorporateUsers(this.corporateId);
    this.getPolicies(this.corporateId, AssetType.Hardware);
  }

  setColData() {
    this.colData = [
      { field: "id", header: "corporateHardware.id" },
      { field: "assetType", header: "corporateHardware.type" },
      { field: "assetTagId", header: "corporateHardware.nfc" },
      { field: "status", header: "corporateHardware.status" },
    ];
  }

  setGridData(data: CorporateHardware[]) {
    this.gridData = data.map((corporateHardware) => {
      return {
        id: corporateHardware.id,
        assetType: corporateHardware.assetType,
        assetTagId: corporateHardware.assetTagId,
        status: !corporateHardware.suspended ? "active" : "inactive",
      };
    });
  }

  getCorporateHardwares(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Hardware>
  ) {
    
    this.subs.add(
      this.corporateHardwareService
        .getCorporateHardwares(
          corporateId,
          removeNullProps({...searchObj, ouIds: this.ouId ? [this.ouId] : null}),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (corporateHardwares: BaseResponse<CorporateHardware>) => {
            if (corporateHardwares.content?.length > 0) {
              this.totalElements = corporateHardwares.totalElements;
              this.corporateHardwares = corporateHardwares.content;
              this.setGridData(this.corporateHardwares);
            } else {
              this.corporateHardwares = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noHardwareFound", "type.warning"])
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

  deleteCorporateHardware() {
    
    this.subs.add(
      this.corporateHardwareService
        .deleteCorporateHardware(this.corporateId, this.corporateHardwareId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporateHardwares(this.corporateId);
            
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
      this.getCorporateHardwares(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateHardwares(this.corporateId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination()
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporateHardwares(this.corporateId, this.submitForm?.value);
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
    this.selectedHardwareArr.forEach((hardware) => {
      if (hardware.assetPolicies.length > 0) {
        hardware.assetPolicies.forEach((policy) => {
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
      this.AssignPolicyForCorporateHardware(false);
    }
  }

  AssignPolicyForCorporateHardware(policyOverwrite) {
    let hardwares: number[] = [];
    hardwares = this.selectedHardwareArr.map((vehicle) => {
      return vehicle.id;
    });
    let assignedPolicyAsset = {
      assetIds: hardwares,
      policyIds: this.selectedPolicyId,
      assetType: AssetType.Vehicle,
    };
    this.subs.add(
      this.corporateHardwareService
        .updateCorporateHardwaresPolicy(
          this.corporateId,
          assignedPolicyAsset,
          policyOverwrite
        )
        .subscribe(
          () => {
            this.translate.get(["success.policyAssigned"]).subscribe((res) => {
              this.toastr.warning(Object.values(res)[0] as string);
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
    const selectedHardware = this.corporateHardwares.filter((hardware) => {
      return selectedItems.includes(hardware.id);
    });
    this.selectedHardwareArr = Object.assign([], selectedHardware);
    if (this.selectedHardwareArr?.length > 0) {
      this.showAssignPolicyBtn = true;
    } else {
      this.showAssignPolicyBtn = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
