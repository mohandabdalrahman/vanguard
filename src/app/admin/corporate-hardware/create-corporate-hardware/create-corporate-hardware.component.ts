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
import { CorporateHardware } from "../corporate-hardware.model";
import { CorporateHardwareService } from "../corporate-hardware.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { NfcTagService } from "@shared/services/nfc-tag.service";
import { NfcTag } from "@models/nfc-tag.model";
import { AssetType } from "@models/asset-type";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { CorporateUserService } from "app/admin/corporate-user/corporate-user.service";
import { User } from "@models/user.model";

@Component({
  selector: "app-create-corporate-hardware",
  templateUrl: "./create-corporate-hardware.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-hardware.component.scss",
  ],
})
export class CreateCorporateHardwareComponent implements OnInit, OnDestroy {
  @ViewChild("corporateHardwareForm") submitForm: NgForm;
  @ViewChild("autoInput") input;
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateId: number;
  corporateHardwareId: number;
  active = true;
  corporateHardware = new CorporateHardware();
  corporateUsers: User[] = [];
  corporateNfcs: NfcTag[] = [];
  assetTags: AssetTag[] = [];
  policies: Policy[] = [];
  policyIds: number[] = [];
  userType: string;
  assetTagName: string;
  currentLang: string;
  isTabView = false;
  detailsUrl: string;
  ouId: number;

  constructor(
    private route: ActivatedRoute,
    private corporateHardwareService: CorporateHardwareService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private corporateUserService: CorporateUserService,
    private assetTagService: AssetTagService,
    private policyService: PolicyService,
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
        this.corporateHardwareId = params["corporateHardwareId"];
      })
    );
    if (this.isUpdateView && this.corporateHardwareId && this.corporateId) {
      this.getCorporateHardware();
    }
    this.getCorporateUsers(this.corporateId);
    this.getCorporateCards(this.corporateId);
    this.getAssetTags(this.corporateId);
    this.getPolicies(this.corporateId, AssetType.Hardware);
  }

  createCorporateHardware() {
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.corporateHardware.suspended = !this.active;
    this.corporateHardware.ouId = this.ouId;
    this.addPolicyIds();
    if (this.submitForm.valid && this.corporateId) {
      
      this.subs.add(
        this.corporateHardwareService
          .createCorporateHardware(this.corporateId, this.corporateHardware)
          .subscribe(
            (hardware) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, hardware.id);
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

  updateCorporateHardware() {
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.corporateHardware.suspended = !this.active;
    this.corporateHardware.ouId = this.ouId;
    this.addPolicyIds();
    if (this.submitForm.valid && this.corporateId && this.corporateHardwareId) {
      
      this.subs.add(
        this.corporateHardwareService
          .updateCorporateHardware(
            this.corporateId,
            this.corporateHardwareId,
            this.corporateHardware
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporateHardware.id);
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

  addPolicyIds() {
    if (this.policyIds.length > 0) {
      this.corporateHardware.assetPolicies = this.policyIds.map((id) => {
        return { policyId: id };
      });
    }
  }

  getCorporateHardware() {
    
    this.subs.add(
      this.corporateHardwareService
        .getCorporateHardware(this.corporateId, this.corporateHardwareId)
        .subscribe(
          (corporateHardware) => {
            if (corporateHardware) {
              this.corporateHardware = corporateHardware;
              this.active = !this.corporateHardware.suspended;

              if (corporateHardware.assetTagId) {
                this.getAssetTag(
                  this.corporateId,
                  corporateHardware.assetTagId
                );
              }
              this.getCorporateNfc(corporateHardware.nfcId);
            } else {
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
          suspended: false,
          isExpired: false,
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

  createAssetTag() {
    const assetTagName = this.input.nativeElement.value;
    this.subs.add(
      this.assetTagService
        .createAssetTag(this.corporateId, assetTagName)
        .subscribe(
          (assetTag: AssetTag) => {
            this.corporateHardware.assetTagId = assetTag.id;
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

  findAssetTagId(value: string) {
    if (value) {
      this.corporateHardware.assetTagId = this.assetTags.find(
        (asset) => asset.enName === value
      ).id;
    }
  }

  handleSuccessResponse(msg: string, hardwareId: number) {
    
    if (this.userType === "admin") {
      this.router.navigate([
        "/admin/corporates",
        this.corporateId,
        "details",
        "hardwares",
        hardwareId,
        "details",
      ]);
    } else {
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, hardwareId, "details"]
          : ["/corporate", "hardwares", hardwareId, "details"]
      );
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
