import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "@models/user.model";
import {ErrorService} from "@shared/services/error.service";
import {Corporate} from "app/admin/corporates/corporate.model";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {
  RoleTag,
  SystemType,
  UserRole,
} from "app/admin/user-roles/user-role.model";
import {UserRolesService} from "app/admin/user-roles/user-role.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateUserService} from "../corporate-user.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {BaseResponse} from "@models/response.model";
import {CorporateCardService} from "@shared/services/corporate-card.service";
import {EMAIL_REGEX, USERNAME_REGEX} from "@shared/constants";
import {AssignCard, Card, NfcType} from "@models/card.model";
import {Admin, CorporateOu, OuNode} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";

@Component({
  selector: "app-create-corporate-user",
  templateUrl: "./create-corporate-user.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-user.component.scss",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCorporateUserComponent implements OnInit, OnDestroy {
  @ViewChild("corporateUserForm") submitForm: NgForm;
  @Input() hideBackBtn = false;
  @Input() isCreateUnitView = false;
  private subs = new SubSink();
  isUpdateView: boolean;
  corporateUser = new User();
  corporateId: number;
  corporateUserId: number;
  roles: UserRole[] = [];
  corporateName: string;
  active = true;
  selectedRoles: number[] = [];
  userType: string;
  currentLang: string;
  corporateCards: Card[] = [];
  serialNumbers: number[] = [];
  nfcId: number;
  tempNfcId: number;
  physicalNfcId: number;
  EMAIL_REGEX = EMAIL_REGEX;
  USERNAME_REGEX = USERNAME_REGEX;
  manexGaugeEnabled = true;
  virtualCard;
  alreadyHasVirtualCard = false;
  ouAdminId: number;
  isTabView = false;
  detailsUrl: string;
  ouId: number;
  corporateOu: CorporateOu;
  selectedOuNode: OuNode;

  constructor(
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private corporateService: CorporateService,
    private userRoleService: UserRolesService,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateCardService: CorporateCardService,
    private cd: ChangeDetectorRef,
    public corporateOuService: CorporateOuService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.isTabView = this.route.snapshot.data["isTabView"];
    this.selectedOuNode = this.corporateOuService?.selectedOuNode || JSON.parse(sessionStorage.getItem('selectedOuNode'));
    if (this.isTabView) {
      const lastIndex = this.isUpdateView ? -2 : -1;
      this.detailsUrl = this.router.url
        .split("/")
        .slice(0, lastIndex)
        .join("/");
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.getCorporateName();
        if (this.router.url.includes('organizational-chart/units')) {
          this.ouId = +getRelatedSystemId(params, "ouId");
        } else if (this.authService.getUserType() === 'admin') {
          this.ouId = (this.authService.isAdminCorporateOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getRootOuId();
        } else {
          this.ouId = (this.authService.isOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getOuId();
        }
      }),
      this.route.params.subscribe((params) => {
        this.corporateUserId = +params["corporateUserId"];
      }),
    );
    this.getUserRoles();
    this.getCorporateCards();
    if (this.isUpdateView && this.corporateUserId && this.corporateId) {
      this.getCorporateUser();
    }

    if (!this.authService.isOuEnabled()) {
      this.corporateOuService.selectedOuNode = null
    }
  }

  createCorporateUser() {
    this.corporateUser.roles = this.roles.filter((role) =>
      this.selectedRoles?.includes(role.id)
    );
    this.corporateUser.suspended = !this.active;
    this.corporateUser.enName = `${
      this.corporateUser.mEnName
        ? this.corporateUser.fEnName +
        " " +
        this.corporateUser.mEnName +
        " " +
        this.corporateUser.lEnName
        : this.corporateUser.fEnName + " " + this.corporateUser.lEnName
    }`;
    this.corporateUser.localeName = `${
      this.corporateUser.mLocaleName
        ? this.corporateUser.fLocaleName +
        " " +
        this.corporateUser.mLocaleName +
        " " +
        this.corporateUser.lLocaleName
        : this.corporateUser.fLocaleName + " " + this.corporateUser.lLocaleName
    }`;
    this.corporateUser.ouId = this.ouId;
    if (this.submitForm.valid && this.corporateId && !this.isCreateUnitView) {
      
      this.subs.add(
        this.corporateUserService
          .createCorporateUser(this.corporateId, this.corporateUser)
          .subscribe(
            (corporateUser) => {
              let cards = [];

              if (this.manexGaugeEnabled) {
                const virtualCard = {
                  userId: corporateUser.id,
                  relatedSystemId: this.corporateId,
                  nfcType: NfcType.CARD,
                  virtual: true,
                  reissue: false,
                };
                cards.push(virtualCard);
              }

              if (this.physicalNfcId) {
                const physicalCard = {
                  userId: corporateUser.id,
                  relatedSystemId: this.corporateId,
                  nfcType: NfcType.CARD,
                  virtual: false,
                  nfcId: this.physicalNfcId,
                  reissue: false,
                };
                cards.push(physicalCard);
              }

              if (cards.length > 0) {
                this.assignCardToUnassignedUser(cards, corporateUser.id);
              } else if (!this.manexGaugeEnabled && !this.physicalNfcId) {
                this.translate.get("createSuccessMsg").subscribe((res) => {
                  this.handleSuccessResponse(res, corporateUser.id);
                });
              }
            },
            (err) => {
              if (
                err
                  .trim()
                  .includes(
                    "Backend returned code 409: Username already exists"
                  )
              ) {
                this.translate
                  .get(["error.userNameAlreadyExists"])
                  .subscribe((res) => {
                    this.toastr.error(Object.values(res)[0] as string);
                  });
                
              } else if (
                err
                  .trim()
                  .includes(
                    "Backend returned code 409: User with this email already exists"
                  )
              ) {
                this.translate
                  .get(["error.emailAlreadyExists"])
                  .subscribe((res) => {
                    this.toastr.error(Object.values(res)[0] as string);
                  });
                
              } else {
                this.errorService.handleErrorResponse(err);
              }
            }
          )
      );
    } else if (this.isCreateUnitView) {
      this.corporateUserService.onCreateCorporateUser(
        this.corporateUser as unknown as Admin
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  assignCardToUnassignedUser(cards: AssignCard[], userId: number) {
    this.subs.add(
      this.corporateCardService
        .assignCardToUnassignedUser(cards)
        .subscribe(() => {
          this.translate.get("createSuccessMsg").subscribe((res) => {
            this.handleSuccessResponse(res, userId);
          });
        })
    );
  }


  updateCorporateUser() {
    this.corporateUser.roles = this.roles.filter((role) =>
      this.selectedRoles.includes(role.id)
    );
    this.corporateUser.suspended = !this.active;
    this.corporateUser.ouId = this.ouId;
    if (this.submitForm.valid && this.corporateId && this.corporateUserId) {
      
      this.subs.add(
        this.corporateUserService
          .updateCorporateUser(
            this.corporateId,
            this.corporateUserId,
            this.corporateUser
          )
          .subscribe(
            () => {
              let cards = [];

              if (this.manexGaugeEnabled && !this.alreadyHasVirtualCard) {
                const card = {
                  userId: this.corporateUser.id,
                  relatedSystemId: this.corporateId,
                  nfcType: NfcType.CARD,
                  virtual: true,
                  reissue: false,
                };
                cards.push(card);
              }

              if (this.physicalNfcId != this.tempNfcId && this.physicalNfcId) {
                const card = {
                  userId: this.corporateUser.id,
                  relatedSystemId: this.corporateId,
                  nfcType: NfcType.CARD,
                  virtual: false,
                  nfcId: this.physicalNfcId,
                  reissue: false,
                };
                cards.push(card);
              }

              if (cards.length > 0) {
                this.assignCardToUnassignedUser(cards, this.corporateUser.id);
              } else {
                this.translate.get("updateSuccessMsg").subscribe((res) => {
                  this.handleSuccessResponse(res, this.corporateUser.id);
                });
              }
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  getCorporateUser() {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUser(this.corporateId, this.corporateUserId)
        .subscribe(
          (corporateUser) => {
            if (corporateUser) {
              this.cd.markForCheck();
              this.corporateUser = corporateUser;
              this.ouId = corporateUser.ouId;
              if (this.ouId && (this.authService.isAdminCorporateOuEnabled() || this.authService.isOuEnabled())) {
                this.getCorporateOuDetails(this.ouId);
              }
              if (corporateUser.nfcIds.length > 0) {
                this.corporateCardService
                  .getCorporateCards(this.corporateId, {
                    suspended: false,
                    ids: corporateUser.nfcIds,
                  })
                  .subscribe((cards) => {
                    this.cd.markForCheck();
                    let card = cards.content.find((c) => !c.virtual);
                    this.manexGaugeEnabled = !!cards.content.find(
                      (c) => c.virtual
                    );
                    this.alreadyHasVirtualCard = !!cards.content.find(
                      (c) => c.virtual
                    );
                    this.virtualCard = cards.content.find((c) => c.virtual);
                    this.physicalNfcId = card?.id;
                    this.tempNfcId = card?.id;
                    if (card) {
                      card["decimalRep"] = parseInt(card?.serialNumber, 16);
                      this.corporateCards.push(card);
                    }
                  });
              } else {
                this.manexGaugeEnabled = false;
              }
              this.active = !this.corporateUser.suspended;
              this.selectedRoles = corporateUser.roles.map((role) => role.id);
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

  getUserRoles() {
    
    this.subs.add(
      this.userRoleService.getUserRoles({suspended: false}).subscribe(
        (roles) => {
          if (roles?.content?.length > 0) {
            this.roles = roles.content.filter(
              (role) => role.systemType === SystemType.corporate
            );
            if (this.isCreateUnitView) {
              this.selectOuAdminRole();
            }
          } else {
            this.translate
              .get(["error.noRolesFound", "type.warning"])
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

  selectOuAdminRole() {
    this.ouAdminId = this.roles.find(
      (role) => role.tag === RoleTag.OU_ADMIN
    )?.id;
    this.selectedRoles = [this.ouAdminId];
  }

  enableManexGaugeAndUser() {
    this.cd.detectChanges();
    this.manexGaugeEnabled = true;
    this.active = true;
  }

  getCorporateName() {
    if (this.corporateId) {
      
      this.subs.add(
        this.corporateService.getCorporate(this.corporateId).subscribe(
          (corporate: Corporate) => {
            if (corporate) {
              this.corporateName =
                this.currentLang === "en"
                  ? corporate?.enName ?? ""
                  : corporate?.localeName ?? "";
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

  getCorporateCards() {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCards(this.corporateId, {
          suspended: false,
          assigned: false,
          virtual: false,
        })
        .subscribe(
          (corporateCards: BaseResponse<Card>) => {
            if (corporateCards.content?.length > 0) {
              this.corporateCards = corporateCards.content;
              for (let index = 0; index < this.corporateCards.length; index++) {
                this.corporateCards[index]["decimalRep"] = parseInt(
                  this.corporateCards[index].serialNumber,
                  16
                );
              }
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
            
            this.cd.markForCheck();
            this.corporateOu = corporateOu;
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }


  handleSuccessResponse(msg: string, userId: number) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "users",
        userId,
        "details",
      ]);
    } else {
      this.router.navigate(
        this.isTabView
          ? [this.detailsUrl, userId, "details"]
          : ["/corporate", "users", userId, "details"]
      );
    }
    this.toastr.success(msg);
  }

  usernameValidation(event) {
    return (
      (event.charCode >= 65 && event.charCode <= 90) ||
      (event.charCode >= 97 && event.charCode <= 122) ||
      (event.charCode >= 48 && event.charCode <= 57)
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
