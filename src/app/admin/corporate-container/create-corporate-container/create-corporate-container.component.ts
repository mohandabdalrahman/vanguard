import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AssetTag } from "@models/asset-tag";
import { Policy } from "@models/policy.model";
import { BaseResponse } from "@models/response.model";
import { AssetTagService } from "@shared/services/asset-tag.service";
import { ErrorService } from "@shared/services/error.service";
import { PolicyService } from "@shared/services/policy.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { CorporateContainer } from "../corporate-container.model";
import { CorporateContainerService } from "../corporate-container.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { NfcTagService } from "@shared/services/nfc-tag.service";
import { NfcTag } from "@models/nfc-tag.model";
import { FuelType } from "../../corporate-vehicle/corporate-vehicle.model";
import { AssetType } from "@models/asset-type";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { User } from "@models/user.model";
import { CorporateUserService } from "app/admin/corporate-user/corporate-user.service";

@Component({
  selector: "app-create-corporate-container",
  templateUrl: "./create-corporate-container.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-container.component.scss",
  ],
})
export class CreateCorporateContainerComponent implements OnInit, OnDestroy {
  @ViewChild("corporateContainerForm") submitForm: NgForm;
  @ViewChild("autoInput") input;
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateContainer = new CorporateContainer();
  corporateId: number;
  corporateContainerId: number;
  active = true;
  assetTags: AssetTag[] = [];
  corporateNfcs: NfcTag[] = [];
  corporateUsers: User[] = [];
  policies: Policy[] = [];
  policyIds: number[] = [];
  userType: string;
  assetTagName: string;
  currentLang: string;

  fuelTypes = Object.keys(FuelType).map((key) => {
    return {
      value: FuelType[key],
    };
  });
  isTabView = false;
  detailsUrl: string;
  ouId: number;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private corporateUserService: CorporateUserService,
    private policyService: PolicyService,
    private corporateContainerService: CorporateContainerService,
    private nfcTagService: NfcTagService,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.isTabView = this.route.snapshot.data["isTabView"];
    if (this.isTabView) {
      const lastIndex = this.isUpdateView ? -2 : -1;
      this.detailsUrl = this.router.url
        .split("/")
        .slice(0, lastIndex)
        .join("/");
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.ouId = params["ouId"];
      }),
      this.route.params.subscribe((params) => {
        this.corporateContainerId = params["corporateContainerId"];
      })
    );
    if (this.isUpdateView && this.corporateContainerId && this.corporateId) {
      this.getCorporateContainer();
    }
    this.getAssetTags(this.corporateId);
    this.getCorporateCards(this.corporateId);
    this.getCorporateUsers(this.corporateId);
    this.getPolicies(this.corporateId, AssetType.Container);
  }

  createCorporateContainer() {
    this.corporateContainer.suspended = !this.active;
    this.corporateContainer.ouId = this.ouId;
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.addPolicyIds();
    if (this.submitForm.valid && this.corporateId) {
      
      this.subs.add(
        this.corporateContainerService
          .createCorporateContainer(this.corporateId, this.corporateContainer)
          .subscribe(
            (container) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, container.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate
        .get(["error.fillMandatoryFields", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  updateCorporateContainer() {
    this.corporateContainer.suspended = !this.active;
    this.corporateContainer.ouId = this.ouId;
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.addPolicyIds();
    if (
      this.submitForm.valid &&
      this.corporateId &&
      this.corporateContainerId
    ) {
      
      this.subs.add(
        this.corporateContainerService
          .updateCorporateContainer(
            this.corporateId,
            this.corporateContainerId,
            this.corporateContainer
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporateContainer.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate
        .get(["error.fillMandatoryFields", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  getCorporateContainer() {
    
    this.subs.add(
      this.corporateContainerService
        .getCorporateContainer(this.corporateId, this.corporateContainerId)
        .subscribe(
          (corporateContainer) => {
            if (corporateContainer) {
              this.corporateContainer = corporateContainer;
              this.active = !this.corporateContainer.suspended;
              this.getCorporateNfc(corporateContainer.nfcId);

              if (corporateContainer.assetTagId) {
                this.getAssetTag(
                  this.corporateId,
                  corporateContainer.assetTagId
                );
              }
            } else {
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

  getAssetTag(corporateId: number, id: number) {
    
    this.subs.add(
      this.assetTagService.getAssetTag(corporateId, id).subscribe(
        (assetTag: AssetTag) => {
          if (assetTag) {
            this.assetTagName = assetTag.enName;
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

  getAssetTags(corporateId: number) {
    
    this.subs.add(
      this.assetTagService
        .getAssetTags(corporateId, { suspended: false })
        .subscribe(
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

  getCorporateNfc(nfcId?: number) {
    
    this.subs.add(
      this.nfcTagService.getNfcTag(this.corporateId, nfcId).subscribe(
        (nfcTag: NfcTag) => {
          if (nfcTag) {
            this.corporateNfcs.push(nfcTag);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporateCards(corporateId: number) {
    
    this.subs.add(
      this.nfcTagService
        .getNfcTags(corporateId, { suspended: false, assigned: false })
        .subscribe(
          (corporateCards: BaseResponse<NfcTag>) => {
            if (corporateCards.content?.length > 0) {
              this.corporateNfcs = corporateCards.content;
            } else {
              this.translate
                .get(["error.noCorporateCards", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
              //this.toastr.warning("No cards found");
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
        .getCorporateUsers(corporateId, { suspended: false })
        .subscribe(
          (corporateUsers) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content.filter(
                (u) => u.nfcIds.length > 0
              );
            } else {
              this.translate
                .get(["error.noCardHolders", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
              //this.toastr.warning("No corporate users found");
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
        .getUnsuspendedPolicies(corporateId, {
          assetType,
          isExpired: false,
          suspended: false,
        })
        .subscribe(
          (policies: Policy[]) => {
            if (policies["content"]?.length > 0) {
              this.policies = policies["content"];
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

  addPolicyIds() {
    if (this.policyIds.length > 0) {
      this.corporateContainer.assetPolicies = this.policyIds.map((id) => {
        return { policyId: id };
      });
    }
  }

  createAssetTag() {
    const assetTagName = this.input.nativeElement.value;
    this.subs.add(
      this.assetTagService
        .createAssetTag(this.corporateId, assetTagName)
        .subscribe(
          (assetTag: AssetTag) => {
            this.corporateContainer.assetTagId = assetTag.id;
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  findAssetTagId(value: string) {
    if (value) {
      this.corporateContainer.assetTagId = this.assetTags.find(
        (asset) => asset.enName === value
      ).id;
    }
  }

  handleSuccessResponse(msg: string, containerId: number) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "containers",
        containerId,
        "details",
      ]);
    } else {
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, containerId, "details"]
          : ["/corporate", "containers", containerId, "details"]
      );
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
