import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AssetTag } from "@models/asset-tag";
import { Policy } from "@models/policy.model";
import { AssetTagService } from "@shared/services/asset-tag.service";
import { ErrorService } from "@shared/services/error.service";
import { PolicyService } from "@shared/services/policy.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { AssetType } from "@models/asset-type";
import { User } from "@models/user.model";
import { UserRole } from "app/admin/user-roles/user-role.model";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { CardHolder } from "@models/card-holder.model";
import { CardHolderService } from "@shared/services/card-holder.service";
import { CorporateUserService } from "app/admin/corporate-user/corporate-user.service";
import { TranslateService } from "@ngx-translate/core";
import { CorporateCardService } from "@shared/services/corporate-card.service";
import { Card } from "@models/card.model";
import { VcardInfo } from "@theme/components/vcard/vcard.model";
import { CorporateService } from "../../corporates/corporate.service";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";

@Component({
  selector: "app-card-holder-detail",
  templateUrl: "./card-holder-detail.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./card-holder-detail.component.scss",
  ],
})
export class CardHolderDetailComponent implements OnInit {
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateId: number;
  active = true;
  policies: Policy[] = [];
  policyIds: number[] = [];
  corporateCards: Card[] = [];
  userType: string;
  corporateUserId: number;
  roles: UserRole[] = [];
  corporateName: string;
  nfcId: number;
  tempNfcId: number;
  cardHolderId: number = null;
  cardHolderDetails: CardHolder;
  cardHolderView: any = {};
  assetPloliciesView: string[] = [];
  currentLang: string;
  suspended: boolean;
  vcardInfo: VcardInfo = {
    corporateId: null,
    cardHolderEnName: "",
    cardHolderLocalName: "",
    companyEnName: "",
    companyLocalName: "",
    serialNumber: null,
  };
  isTabView: boolean = false;
  updateUrl: string;
  corporateOu: CorporateOu

  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    private corporateService: CorporateService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private assetTagService: AssetTagService,
    private authService: AuthService,
    private corporateCardService: CorporateCardService,
    private cardHolderService: CardHolderService,
    private policyService: PolicyService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private corporateOuService: CorporateOuService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.isTabView = this.route.snapshot.data["isTabView"];
    if (this.isTabView) {
      this.updateUrl =
        this.router.url.split("/").slice(0, -1).join("/") + "/update";
    }
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.cardHolderId = +params["cardHolderId"];
      })
    );
    this.getCardHolderDetails();
  }

  getCorporateCards(cardIds: number[]) {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCards(this.corporateId, { ids: cardIds })
        .subscribe(
          (corporateCards) => {
            if (corporateCards.content.length > 0) {
              let card = corporateCards.content.find((c) => !c.virtual);
              let vcard = corporateCards.content.find((c) => c.virtual);

              if (card) {
                this.cardHolderView["serialNumber"] = parseInt(
                  card.serialNumber,
                  16
                );
              }
              if (vcard) {
                this.vcardInfo.serialNumber = vcard.serialNumber;
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
        .getCardHolder(this.corporateId, this.cardHolderId)
        .subscribe(
          (cardHolder) => {
            if (cardHolder) {
              this.cardHolderDetails = Object.assign({}, cardHolder);
              this.policyIds = cardHolder.assetPolicies.map((policy) => {
                return policy.policyId;
              });

              if (cardHolder.assetTagId) {
                this.getAssetTag(this.corporateId, cardHolder.assetTagId);
              }
              //this.cardHolderView['suspended'] = cardHolder.suspended;
              this.cardHolderView["enName"] = cardHolder.enName;
              this.cardHolderView["localeName"] = cardHolder.localeName;
              this.vcardInfo.cardHolderEnName = cardHolder.enName;
              this.vcardInfo.cardHolderLocalName = cardHolder.localeName;
              this.getCorporateDetails(this.corporateId);

              if(cardHolder?.ouId && this.authService.isOuEnabled()){
                this.getCorporateOuDetails(cardHolder.ouId);
              }

              if (this.policyIds.length > 0) {
                this.getPolicies();
              }
              this.getUsersDetails(this.cardHolderDetails?.corporateUserId);
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

  getCorporateDetails(corporateId) {
    this.subs.add(
      this.corporateService.getCorporate(corporateId).subscribe((corporate) => {
        if (corporate) {
          this.vcardInfo.companyEnName = corporate.enName;
          this.vcardInfo.companyLocalName = corporate.localeName;
        }
      })
    );
  }

  getCorporateOuDetails(ouId: number) {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            this.corporateOuService.setOuName(this.cardHolderView, this.corporateOu, this.currentLang);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getUsersDetails(userId) {
    this.subs.add(
      this.corporateUserService
        .getCorporateUser(this.corporateId, userId)
        .subscribe((user: User) => {
          if (user) {
            this.suspended = user.suspended;
            this.getCorporateCards(user.nfcIds);
          }
        })
    );
  }

  getPolicies() {
    
    this.subs.add(
      this.policyService
        .getUnsuspendedPolicies(this.corporateId, {
          assetType: AssetType.User,
          ids: this.policyIds,
        })
        .subscribe(
          (policies: Policy[]) => {
            if (policies["content"]?.length > 0) {
              this.policies = policies["content"];
              this.assetPloliciesView = this.policies.map((policy) => {
                return this.currentLang === "en"
                  ? policy?.enName ?? ""
                  : policy?.localeName ?? "";
              });
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

  getAssetTag(corporateId: number, id: number) {
    
    this.subs.add(
      this.assetTagService.getAssetTag(corporateId, id).subscribe(
        (assetTag: AssetTag) => {
          if (assetTag) {
            this.cardHolderView["assetTag"] = assetTag.enName;
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
}