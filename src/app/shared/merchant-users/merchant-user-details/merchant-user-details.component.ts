import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { removeUnNeededProps } from "@helpers/remove-props";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { MerchantUser } from "../merchant-user.model";
import { MerchantUserService } from "../merchant-user.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { CardService } from "@shared/services/card.service";
import { Card } from "@models/card.model";
import { SiteService } from "@shared/sites/site.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { TranslateService } from "@ngx-translate/core";
import { UserRole } from "../../../admin/user-roles/user-role.model";

@Component({
  selector: "app-merchant-user-details",
  templateUrl: "./merchant-user-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./merchant-user-details.component.scss",
  ],
})
export class MerchantUserDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantUser = {};
  merchantId: number;
  merchantUserId: number;
  userType: string;
  currentLang: string;
  suspended: boolean;
  userRoles: UserRole[] = [];

  constructor(
    private route: ActivatedRoute,
    private merchantUserService: MerchantUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private cardService: CardService,
    private authService: AuthService,
    private siteService: SiteService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        if (this.userRoles.length) {
          this.handleUserRoles(this.userRoles);
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.merchantUserId = params["merchantUserId"];
      })
    );
    if (this.merchantId && this.merchantUserId) {
      this.showMerchantUserDetails();
    }
  }

  showMerchantUserDetails(): void {
    
    this.subs.add(
      this.merchantUserService
        .getMerchantUser(this.merchantId, this.merchantUserId)
        .subscribe(
          (merchantUser: MerchantUser) => {
            if (merchantUser) {
              const { roles, suspended, siteId, ...other } =
                removeUnNeededProps(merchantUser, [
                  "typeId",
                  "relatedSystemId",
                  "description",
                ]);
              this.merchantUser = other;
              this.suspended = merchantUser.suspended;
              this.userRoles = roles;
              this.handleUserRoles(this.userRoles);
              if (merchantUser.nfcId) {
                this.getCard();
              }
              siteId ? this.getSite(siteId) : null;
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

  handleUserRoles(roles: UserRole[]) {
    this.merchantUser["userRole"] = roles
      .map((role) => {
        return this.currentLang === "en"
          ? role?.enName ?? ""
          : ((role?.localeName ?? "") as string);
      })
      .join(",");
  }

  getSite(siteId: number) {
    
    this.subs.add(
      this.siteService.getMerchantSite(this.merchantId, siteId).subscribe(
        (merchantSite) => {
          if (merchantSite) {
            this.merchantUser["site"] =
              this.currentLang === "en"
                ? merchantSite?.enName ?? ""
                : merchantSite?.localeName ?? "";
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCard() {
    
    this.subs.add(
      this.cardService
        .getCard("merchant", this.merchantId, this.merchantUser["nfcId"])
        .subscribe(
          (merchantCard: Card) => {
            if (merchantCard) {
              this.merchantUser["nfcId"] = merchantCard.serialNumber;
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
