import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Card} from "@models/card.model";
import {CardService} from "@shared/services/card.service";
import {ErrorService} from "@shared/services/error.service";
import {SystemType, UserRole} from "app/admin/user-roles/user-role.model";
import {UserRolesService} from "app/admin/user-roles/user-role.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MerchantUser} from "../merchant-user.model";
import {MerchantUserService} from "../merchant-user.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {SiteService} from "@shared/sites/site.service";
import {MerchantSite} from "@shared/sites/site.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EMAIL_REGEX, USERNAME_REGEX} from "@shared/constants";

@Component({
  selector: "app-create-merchant-user",
  templateUrl: "./create-merchant-user.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-merchant-user.component.scss",
  ],
})
export class CreateMerchantUserComponent implements OnInit, OnDestroy {
  @ViewChild("merchantUserForm") submitForm: NgForm;
  private subs = new SubSink();
  isUpdateView: boolean;
  merchantUser = new MerchantUser();
  merchantId: number;
  merchantUserId: number;
  roles: UserRole[] = [];
  merchantCards: Card[] = [];
  active = true;
  selectedRoles: number[] = [];
  userType: string;
  sites: MerchantSite[] = [];
  isRequired = false;
  tempField: string;
  currentLang: string;
  nfcId: number;
  tempNfcId: number;
  EMAIL_REGEX = EMAIL_REGEX;
  USERNAME_REGEX = USERNAME_REGEX;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private userRoleService: UserRolesService,
    private merchantUserService: MerchantUserService,
    private cardService: CardService,
    private authService: AuthService,
    private siteService: SiteService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.merchantUserId = params["merchantUserId"];
      })
    );
    this.getUserRoles();
    this.getCards();
    this.getSites();
    if (this.isUpdateView && this.merchantUserId && this.merchantId) {
      this.getMerchantUser();
    }
  }

  createMerchantUser() {
    this.merchantUser.roles = this.roles.filter((role) =>
      this.selectedRoles.includes(role.id)
    );
    this.merchantUser.suspended = !this.active;
    this.merchantUser.enName = `${this.merchantUser.fEnName} ${this.merchantUser.mEnName} ${this.merchantUser.lEnName}`;
    this.merchantUser.localeName = `${this.merchantUser.fLocaleName} ${this.merchantUser.mLocaleName} ${this.merchantUser.lLocaleName}`;
    if (this.submitForm.valid && this.merchantId) {
      
      this.subs.add(
        this.merchantUserService
          .createMerchantUser(this.merchantId, this.merchantUser)
          .subscribe(
            (merchantUser) => {
              if (this.merchantUser.nfcId) {
                this.assignCardToUser(this.merchantUser.nfcId, merchantUser.id);
              } else {
                this.translate.get("createSuccessMsg").subscribe(
                  (res) => {
                    this.handleSuccessResponse(res, merchantUser.id);
                  }
                );
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

  updateMerchantUser() {
    this.merchantUser.roles = this.roles.filter((role) =>
      this.selectedRoles.includes(role.id)
    );
    this.merchantUser.suspended = !this.active;
    if (this.submitForm.valid && this.merchantId && this.merchantUserId) {
      
      this.subs.add(
        this.merchantUserService
          .updateMerchantUser(
            this.merchantId,
            this.merchantUserId,
            this.merchantUser
          )
          .subscribe(
            () => {
              let anyCalled = false;
              if ((this.merchantUser.nfcId != this.tempNfcId) && this.tempNfcId) {
                this.unAssignCardFromUser(this.tempNfcId);
              }
              if (this.merchantUser.nfcId != this.tempNfcId && this.merchantUser.nfcId) {
                setTimeout(() => this.assignCardToUser(this.merchantUser.nfcId, this.merchantUser.id), 1000);
                anyCalled = true;
              }
              if (!anyCalled) {
                this.translate.get("updateSuccessMsg").subscribe(
                  (res) => {
                    this.handleSuccessResponse(res, this.merchantUserId);
                  }
                );
              }
            }
            ,
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  getMerchantUser() {
    
    this.subs.add(
      this.merchantUserService
        .getMerchantUser(this.merchantId, this.merchantUserId)
        .subscribe(
          (merchantUser) => {
            if (merchantUser) {
              this.merchantUser = merchantUser;
              if (merchantUser.nfcId) {
                this.getCard(merchantUser.nfcId)
              }
              this.active = !this.merchantUser.suspended;
              this.tempNfcId = merchantUser.nfcId;
              this.selectedRoles = merchantUser.roles.map((role) => role.id);
              this.onRoleChange();
            } else {
              this.translate.get(["error.noUsersFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
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
              (role) => role.systemType === SystemType.merchant
            );
          } else {
            this.translate.get(["error.noRolesFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getSites() {
    
    this.subs.add(
      this.siteService.getMerchantSiteList(this.merchantId, {suspended: false}, null , 200).subscribe(
        (sites) => {
          if (sites?.content?.length > 0) {
            this.sites = sites.content;
          } else {
            this.translate.get(["error.noSitesFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCards() {
    
    this.subs.add(
      this.cardService
        .getCards("merchant", this.merchantId, {suspended: false, assigned: false})
        .subscribe(
          (cards) => {
            if (cards?.content?.length > 0) {
              this.merchantCards = cards.content;
              for (let index = 0; index < this.merchantCards.length; index++) {
                this.merchantCards[index]["decimalRep"] = parseInt(this.merchantCards[index].serialNumber, 16);

              }
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCard(cardId: number) {
    // 
    this.subs.add(
      this.cardService
        .getCard("merchant", this.merchantId, cardId)
        .subscribe(
          (card) => {
            if (card) {
              this.merchantCards.push(card);
              this.merchantUser.nfcId = card.id;
              this.tempNfcId = card.id;
            } else {
              this.translate.get(["error.noCards", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
            }
            // 
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  assignCardToUser(nfcId: number, userId: number) {
    this.subs.add(
      this.cardService
        .assignCardToUser("merchant", this.merchantId, nfcId, userId)
        .subscribe(
          () => {
            this.handleSuccessResponse(
              "Merchant user has been updated successfully",
              this.merchantUserId
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  async unAssignCardFromUser(nfcId: number): Promise<boolean> {
    await this.cardService
      .unAssignCardFromUser("merchant", this.merchantId, nfcId).toPromise();
    return true;
  }


  handleSuccessResponse(msg: string, userId: number) {
    
    if (this.userType === 'admin') {
      this.router.navigate([
        "/admin/merchants",
        this.merchantId,
        "details",
        "users",
        userId,
        "details",
      ]);
    } else {
      this.router.navigate([
        "/merchant",
        "users",
        userId,
        "details",
      ]);
    }
    this.toastr.success(msg);
  }

  onRoleChange() {
    let roles: UserRole[] = [];
    this.isRequired = false;
    this.selectedRoles.forEach((role) => {
      roles.push(this.roles.find((r) => r.id === role));
    })
    if (roles.length) {
      roles.forEach((role) => {
        if (role?.mandatoryFields?.length > 0) {
          role.mandatoryFields.forEach((f) => {
            if (this.submitForm.form.controls[f.field]) {
              this.tempField = f.field
              this.submitForm.form.get(f.field).setValidators([Validators.required])
              this.submitForm.form.get(f.field).updateValueAndValidity();
              this.isRequired = true;
            }
          });

        } else {
          if (this.tempField && !this.isRequired) {
            this.resetRequiredField(this.tempField)
          }
        }
      })
    } else {
      this.resetRequiredField(this.tempField)
    }
  }

  resetRequiredField(fieldName: string) {
    this.submitForm.form.get(fieldName)?.setValidators([])
    this.submitForm.form.get(fieldName)?.updateValueAndValidity();
    this.submitForm.form.get(fieldName)?.setValue('');
    this.isRequired = false;
  }


  usernameValidation(event) {
    return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode >= 48 && event.charCode <= 57);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

