import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Policy } from "@models/policy.model";
import { ErrorService } from "@shared/services/error.service";
import { PolicyService } from "@shared/services/policy.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { AssetType } from "@models/asset-type";
import { CorporateService } from "app/admin/corporates/corporate.service";
import { User } from "@models/user.model";
import { UserRole } from "app/admin/user-roles/user-role.model";
import { Corporate } from "app/admin/corporates/corporate.model";
import { TranslateService } from "@ngx-translate/core";
import { AssetTag } from "@models/asset-tag";
import { BaseResponse } from "@models/response.model";
import { AssetTagService } from "@shared/services/asset-tag.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { CardHolder } from "@models/card-holder.model";
import { CardHolderService } from "@shared/services/card-holder.service";
import { CorporateUserService } from "app/admin/corporate-user/corporate-user.service";
import { CorporateCardService } from "@shared/services/corporate-card.service";
import { Card } from "@models/card.model";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {removeNullProps} from "@helpers/check-obj";

@Component({
  selector: "app-update-card-holder",
  templateUrl: "./update-card-holder.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./update-card-holder.component.scss",
  ],
})
export class UpdateCardHolderComponent implements OnInit {
  @ViewChild("userAssetFrom") submitForm: NgForm;
  @ViewChild("autoInput") input;
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateId: number;
  active: boolean;
  policies: Policy[] = [];
  policyIds: number[] = [];
  corporateCards: Card[] = [];
  userType: string;
  corporateUser = new User();
  corporateUserId: number;
  roles: UserRole[] = [];
  corporateName: string;
  assetId: number;
  cardHolderDetails = new CardHolder();
  assetTags: AssetTag[] = [];
  assetTagName: string;
  currentLang: string;
  serialNumber: number = null;
  isTabView = false;
  detailsUrl: string;
  ouId: number;
  corporateOu: CorporateOu
  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private corporateService: CorporateService,
    private authService: AuthService,
    private corporateCardService: CorporateCardService,
    private cardHolderService: CardHolderService,
    private policyService: PolicyService,
    private assetTagService: AssetTagService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateOuService: CorporateOuService
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
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
        this.ouId = +params["ouId"] || this.authService.getOuId();
        this.getCorporateName();
      }),
      this.route.params.subscribe((params) => {
        this.assetId = +params["cardHolderId"];
      })
    );
    this.getAssetTags(this.corporateId);
    this.getCardHolderDetails();
  }

  getCorporateName() {
    if (this.corporateId) {
      
      this.subs.add(
        this.corporateService.getCorporate(this.corporateId).subscribe(
          (corporate: Corporate) => {
            if (corporate) {
              this.corporateName =
                this.currentLang === "en"
                  ? corporate.enName
                  : corporate.localeName;
            } else {
              this.translate
                .get(["error.noCorporateFound", "type.warning"])
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
      console.error("no correlation id provided");
    }
  }

  getCorporateCards(cardIds: number[]) {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCards(this.corporateId, { ids: cardIds })
        .subscribe(
          (corporateCards) => {
            if (!corporateCards.empty) {
              let physicalCard = corporateCards.content.find((c) => !c.virtual);
              if (physicalCard) {
                this.serialNumber = parseInt(physicalCard.serialNumber, 16);
              }
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCardHolderDetails() {
    
    this.subs.add(
      this.cardHolderService
        .getCardHolder(this.corporateId, this.assetId)
        .subscribe(
          (cardHolder) => {
            if (cardHolder) {
              this.cardHolderDetails = cardHolder;
              this.ouId = cardHolder.ouId;
              this.active = !this.cardHolderDetails.suspended;
              this.policyIds = cardHolder.assetPolicies.map((p) => p.policyId);
              this.getPolicies(this.corporateId, AssetType.User);
              if(this.ouId && this.authService.isOuEnabled()){
                this.getCorporateOuDetails(this.ouId);
              }

              if (cardHolder.assetTagId) {
                this.getAssetTag(this.corporateId, cardHolder.assetTagId);
              }
              this.getUsersDetails(
                this.corporateId,
                this.cardHolderDetails?.corporateUserId
              );
            } else {
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

  getUsersDetails(corporateId, userId) {
    this.subs.add(
      this.corporateUserService
        .getCorporateUser(corporateId, userId)
        .subscribe((user: any) => {
          if (user) {
            this.getCorporateCards(user.nfcIds);
          }
        })
    );
  }

  getPolicies(corporateId: number, assetType: AssetType) {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(corporateId, removeNullProps({
          assetType,
          suspended: false,
          isExpired: false,
          ouIds: this.ouId ? this.ouId : null,
        }))
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

  updateCardHolder() {
    this.cardHolderDetails.suspended = !this.active;
    this.cardHolderDetails.ouId = this.ouId;
    const assetTagName = this.input?.nativeElement?.value;
    this.findAssetTagId(assetTagName);
    this.convertPolicyIdsToAssetPolicies();
    
    this.subs.add(
      this.cardHolderService
        .updateCardHolderPolicy(
          this.corporateId,
          this.cardHolderDetails.id,
          this.cardHolderDetails
        )
        .subscribe(
          () => {
            this.translate.get("updateSuccessMsg").subscribe((res) => {
              this.handleSuccessResponse(res, this.cardHolderDetails.id);
            });
          },
          (err) => {
            if (err.includes("409")) {
              location.reload();
            }
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
            this.assetTags.push(assetTag);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  findAssetTagId(value: string) {
    if (value) {
      this.cardHolderDetails.assetTagId = this.assetTags.find(
        (asset) => asset.enName === value
      )?.id;
    }
  }

  convertPolicyIdsToAssetPolicies() {
    this.cardHolderDetails.assetPolicies = this.policyIds.map((id) => {
      return { policyId: id };
    });
  }

  getCorporateOuDetails(ouId: number) {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  handleSuccessResponse(msg: string, cardHolderId: number) {
    
    if (this.userType == "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "card-holders",
        cardHolderId,
        "details",
      ]);
    } else {
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, cardHolderId, "details"]
          : [`/corporate`, "card-holder", cardHolderId, "details"]
      );
    }
    this.toastr.success(msg);
  }
}
