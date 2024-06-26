import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {User} from "@models/user.model";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateUserService} from "../corporate-user.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";
import {CorporateCardService} from "@shared/services/corporate-card.service";
import {UserRole} from "../../user-roles/user-role.model";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";

@Component({
  selector: "app-corporate-user-details",
  templateUrl: "./corporate-user-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-user-details.component.scss",
  ],
})
export class CorporateUserDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateUser = {};
  corporateId: number;
  corporateUserId: number;
  userType: string;
  currentLang: string;
  status: boolean;
  suspended: boolean;
  virtualCard: boolean;
  userRoles: UserRole[] = [];
  isTabView: boolean = false;
  updateUrl: string;
  corporateOu: CorporateOu;
  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    private corporateCardService: CorporateCardService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private router: Router,
    private corporateOuService: CorporateOuService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"]
    if (this.isTabView) {
      this.updateUrl = this.router.url.split("/").slice(0, -1).join("/") + "/update"
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        if (this.userRoles.length) {
          this.handleUserRoles(this.userRoles);
        }
        this.corporateOuService.setOuName(this.corporateUser, this.corporateOu , this.currentLang)
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.corporateUserId = params["corporateUserId"];
      })
    );
    if (this.corporateId && this.corporateUserId) {
      this.showCorporateUserDetails();
    } else {
      this.translate
        .get(["error.invalidUrl", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  showCorporateUserDetails(): void {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUser(this.corporateId, this.corporateUserId)
        .subscribe(
          (corporateUser: User) => {
            if (corporateUser) {
              const {roles, suspended, nfcIds, ouId, ...other} =
                removeUnNeededProps(corporateUser, [
                  "relatedSystemId",
                  "typeId",
                  "id",
                  "preferredLanguage",
                  "manexGaugeEnabled",
                  "masterSystemId",
                ]);
              this.corporateUser = other;
              //todo handle status language

              this.status = !suspended; //? "active" : "inactive";
              this.userRoles = roles;
              this.handleUserRoles(this.userRoles);
              if (ouId && this.authService.isOuEnabled()) {
                this.getCorporateOuDetails(ouId)
              }

              if (nfcIds.length > 0) {
                this.getCorporateCards(nfcIds);
              } else {
                this.virtualCard = false;
              }
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
    this.corporateUser["userRole"] = roles
      .map((role) => {
        return this.currentLang === "en"
          ? role?.enName ?? ""
          : ((role?.localeName ?? "") as string);
      })
      .join(", ");
  }

  getCorporateCards(nfcIds: number[]) {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCards(this.corporateId, {ids: nfcIds})
        .subscribe(
          (corporateCards) => {
            if (corporateCards) {
              this.virtualCard =
                corporateCards.content.find((c) => c.virtual) != null
                  ? corporateCards.content.find((c) => c.virtual).virtual
                  : false;

              this.corporateUser["nfcId"] = corporateCards.content.find(
                (c) => !c.virtual
              )
                ? parseInt(
                  corporateCards.content.find((c) => !c.virtual)
                    ?.serialNumber,
                  16
                )
                : "";
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateOuDetails(ouId: number) {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            this.corporateOuService.setOuName(this.corporateUser, this.corporateOu , this.currentLang);
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
