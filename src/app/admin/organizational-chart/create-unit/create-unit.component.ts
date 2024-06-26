import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ProductCategory } from "../../product/product-category.model";
import { BaseResponse } from "@models/response.model";
import { ProductCategoryService } from "../../product/productCategory.service";

import { ErrorService } from "@shared/services/error.service";
import { SubSink } from "subsink";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { NgForm } from "@angular/forms";
import { User } from "@models/user.model";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { CorporateUserService } from "../../corporate-user/corporate-user.service";
import { CorporateService } from "../../corporates/corporate.service";
import { City } from "../../cities/city.model";
import { CityService } from "../../cities/city.service";
import {
  BalanceDistributionMode,
  CorporateOu,
  OuNode,
  OuTreeNode,
  OuType,
} from "../corporate-ou.model";
import { CorporateOuService } from "../corporate-ou.service";
import { NbStepperComponent } from "@nebular/theme/components/stepper/stepper.component";
import { CreateCorporateUserComponent } from "../../corporate-user/create-corporate-user/create-corporate-user.component";
import { AuthService } from "../../../auth/auth.service";
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NbTagComponent } from "@nebular/theme";
import { NfcType } from "@models/card.model";
import { CorporateCardService } from "@shared/services/corporate-card.service";

@Component({
  selector: "app-create-unit",
  templateUrl: "./create-unit.component.html",
  styleUrls: ["./create-unit.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CreateUnitComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("unitForm") submitForm: NgForm;
  @ViewChild("stepper") private stepperComponent: NbStepperComponent;
  @ViewChild("userForm") submitForm2: NgForm;
  @ViewChild("unitModal") private modalComponent: ModalComponent;
  @ViewChild("createUserModal")
  private createUserModalComponent: ModalComponent;
  @ViewChild("createUserComp")
  private createCorporateUserComponent: CreateCorporateUserComponent;

  productCategories: ProductCategory[] = [];
  productCategoryIds: number[] = [];
  userIds: number[] = [];
  currentLang: string;
  corporateUsers: User[] = [];
  corporateId: number;
  cities: City[] = [];
  listCorporateOus = [new OuTreeNode()];
  corporateOu = new CorporateOu();
  parentOu = new OuNode();
  ouTypes = Object.keys(OuType).map((key) => {
    return {
      value: OuType[key],
    };
  });

  balanceDistributionModes = Object.keys(BalanceDistributionMode).map((key) => {
    return {
      value: BalanceDistributionMode[key],
    };
  });
  selectedStep = 0;
  ouId: number;
  state$: Observable<any>;
  openUserModal = false;
  assignAdminFlow = false;
  redirectUrl = "";
  newCreatedOuId: number;
  userId: number;
  trees = [];
  userType: string;

  constructor(
    private productCategoryService: ProductCategoryService,
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateUserService: CorporateUserService,
    private router: Router,
    private corporateService: CorporateService,
    private route: ActivatedRoute,
    private cityService: CityService,
    private corporateOuService: CorporateOuService,
    private authService: AuthService,
    private corporateCardService: CorporateCardService
  ) {}

  @HostListener("window:beforeunload", ["$event"])
  beforeunloadHandler() {
    return this.checkFormSubmission();
  }

  private checkFormSubmission() {
    if (this.submitForm.dirty && !this.submitForm.submitted) {
      return confirm(
        this.currentLang === "en"
          ? "Are you sure you want to leave?"
          : "هل أنت متأكد انك تريد الرجوع؟"
      );
    }
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.userId = this.authService.getUserId();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.ouId = this.userType === 'admin' ? this.authService.getRootOuId() : this.authService.getOuId();
    this.corporateId = +getRelatedSystemId(null, "corporateId");
    this.state$ = this.route.paramMap.pipe(map(() => window.history.state));

    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.trees = this.corporateOu?.admins?.map((user) =>
          this.currentLang === "en" ? user.enName : user.localeName
        );
      }),
      this.corporateUserService.corporateUser$.subscribe((corporateUser) => {
        corporateUser.ouId = this.newCreatedOuId;
        this.corporateOu?.admins?.push(corporateUser as unknown as any);
        this.trees = this.corporateOu?.admins?.map((user) =>
          this.currentLang === "en" ? user.enName : user.localeName
        );
        this.createUserModalComponent.closeModal();
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.state$.subscribe((data) => {
        if (data?.id) {
          this.setParentOu(data.id);
          this.parentOu = data;
          this.checkOuType(this.parentOu);
          this.checkBalanceMode(this.parentOu);
          this.getCorporateUsers();
          this.selectedStep = 1;
        }
      })
    );
    this.redirectUrl = this.userType === 'corporate' ? "/corporate/organizational-chart/units" : `/admin/corporates/${this.corporateId}/organizational-chart/units`
    if (this.corporateOuService?.listCorporateOus?.children?.length) {
      this.listCorporateOus = [this.corporateOuService.listCorporateOus];
    } else {
      this.getCorporateOuHierarchy();
    }
    this.getCorporate();
  }

  getProductCategories(countryId: number) {
    
    this.subs.add(
      this.productCategoryService
        .getProducts({ suspended: false, countryId: countryId })
        .subscribe(
          (products: BaseResponse<ProductCategory>) => {
            if (products.content?.length > 0) {
              this.productCategories = products.content;
            } else {
              this.translate
                .get(["error.noProductCategoriesFound", "type.warning"])
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

  getCorporateUsers() {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(this.corporateId, {
          ouId: this.parentOu.id,
          suspended: false,
        })
        .subscribe(
          (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content;
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

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.getProductCategories(corporate.countryId);
            this.getCities(corporate.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporateOuHierarchy(): void {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (corporateOus) => {
            if (corporateOus) {
              this.listCorporateOus = [corporateOus];
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCities(countryId: number) {
    if (countryId) {
      
      this.subs.add(
        this.cityService.getCities(countryId, { suspended: false }).subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content?.length > 0) {
              this.cities = cities.content;
            } else {
              this.cities = [];
              this.translate
                .get(["error.noCityFound", "type.warning"])
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
      console.error("no country id provided");
    }
  }

  createCorporateOu(createAnotherUnit = false, assignAdmins = false) {
    this.setCorporateOuData();
    if (this.submitForm.valid && this.corporateId) {
      
      if (createAnotherUnit) {
        this.selectedStep = 0;
      }
      this.subs.add(
        this.corporateOuService
          .createCorporateOu(this.corporateId, this.corporateOu)
          .subscribe(
            async (newCreatedOu) => {
              this.newCreatedOuId = newCreatedOu.id;
              if (!createAnotherUnit) {
                const refreshToken = sessionStorage.getItem("refreshToken");
                this.authService
                  .getRefreshToken(refreshToken)
                  .subscribe(async ({ token, refreshTokenDto }) => {
                    // over ride token in session storage
                    this.authService.overRideToken(token, refreshTokenDto);
                    if (assignAdmins) {
                      this.selectedStep = 2;
                    } else {
                      await this.router.navigateByUrl(`${this.redirectUrl}`);
                    }
                  });
              } else {
                // this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                // });
                this.handleCreateAnotherUnit();
                // this.router.navigate([`${redirectUrl}/create`]);
              }
              this.modalComponent.closeModal();
              this.translate.get(["success.unitCreated"]).subscribe((res) => {
                this.toastr.success(Object.values(res)[0] as string);
              });
            },
            (err) => {
              this.modalComponent.closeModal();
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

  assignOuAdmin(createAnotherUnit = false) {
    
    if (createAnotherUnit) {
      this.selectedStep = 0;
    }
    if (this.userIds?.length && this.corporateOu.admins.length) {
      this.subs.add(
        forkJoin([
          this.corporateOuService.transferUsers(
            this.corporateId,
            this.parentOu.id,
            this.newCreatedOuId,
            this.userIds
          ),
          this.corporateUserService.createCorporateUsersList(
            this.corporateId,
            this.corporateOu.admins
          ),
        ]).subscribe(
          async ([_, admins]) => {
            const adminsIds = admins.map((admin) => admin.id);
            if (adminsIds.length) {
              await this.assignCardToAdmins(adminsIds);
            }
            await this.handleSuccessAssignAdmins(createAnotherUnit);
          },
          (err) => {
            this.modalComponent.closeModal();
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else if (this.userIds?.length) {
      this.subs.add(
        this.corporateOuService
          .transferUsers(
            this.corporateId,
            this.parentOu.id,
            this.newCreatedOuId,
            this.userIds
          )
          .subscribe(
            async () => {
              await this.handleSuccessAssignAdmins(createAnotherUnit);
            },
            (err) => {
              this.modalComponent.closeModal();
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else if (this.corporateOu.admins.length) {
      this.subs.add(
        this.corporateUserService
          .createCorporateUsersList(this.corporateId, this.corporateOu.admins)
          .subscribe(
            async (admins) => {
              const adminsIds = admins.map((admin) => admin.id);
              if (adminsIds.length) {
                await this.assignCardToAdmins(adminsIds);
              }
              await this.handleSuccessAssignAdmins(createAnotherUnit);
            },
            (err) => {
              this.modalComponent.closeModal();
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.handleSuccessAssignAdmins(createAnotherUnit);
    }
  }

  async assignCardToAdmins(adminsIds: number[]) {
    let cards = [];
    if (this.createCorporateUserComponent?.manexGaugeEnabled) {
      adminsIds.forEach((userId) => {
        const virtualCard = {
          userId,
          relatedSystemId: this.corporateId,
          nfcType: NfcType.CARD,
          virtual: true,
          reissue: false,
        };
        cards.push(virtualCard);
      });
    }
    if (this.createCorporateUserComponent?.physicalNfcId) {
      adminsIds.forEach((userId) => {
        const physicalCard = {
          userId,
          relatedSystemId: this.corporateId,
          nfcType: NfcType.CARD,
          virtual: false,
          nfcId: this.createCorporateUserComponent?.physicalNfcId,
          reissue: false,
        };
        cards.push(physicalCard);
      });
    }
    await this.corporateCardService
      .assignCardToUnassignedUser(cards)
      .toPromise();
  }

  async handleSuccessAssignAdmins(createAnotherUnit: boolean) {
    if (!createAnotherUnit) {
      this.translate.get(["success.unitAdminsAssigned"]).subscribe((res) => {
        this.toastr.success(Object.values(res)[0] as string);
      });
      // check userId included in userIds
      if (this.userIds?.includes(this.userId)) {
        const refreshToken = sessionStorage.getItem("refreshToken");
        this.authService
          .getRefreshToken(refreshToken)
          .subscribe(async ({ token, refreshTokenDto }) => {
            // over ride token in session storage
            this.authService.overRideToken(token, refreshTokenDto);
            await this.router.navigateByUrl(`${this.redirectUrl}`);
          });
      } else {
        await this.router.navigateByUrl(`${this.redirectUrl}`);
      }
    } else {
      this.handleCreateAnotherUnit();
      this.userIds = [];
      this.corporateOu.admins = [];
    }
    this.modalComponent.closeModal();
  }

  handleCreateAnotherUnit() {
    const parentOu = this.corporateOu.parentId;
    this.setParentOu(parentOu);
    this.submitForm.controls["enName"].reset();
    this.submitForm.controls["localeName"].reset();
    this.submitForm.controls["cityId"].reset();
    this.submitForm.controls["productCategories"].reset();
    this.checkOuType(this.parentOu);
    this.checkBalanceMode(this.parentOu);
    this.submitForm2.reset();
    this.selectedStep = 1;
  }

  setParentOu(ouId: number) {
    this.corporateOu = new CorporateOu();
    this.corporateOu.parentId = ouId;
  }

  setCorporateOuData() {
    if (this.productCategoryIds?.length) {
      this.corporateOu.allowedProductCategoryIds = this.productCategoryIds;
    }
  }

  getSelectedOu(parentOu: OuNode) {
    if (parentOu) {
      this.parentOu = parentOu;
      this.corporateOu.parentId = parentOu?.id;
    } else {
      this.parentOu = null;
      this.corporateOu.parentId = null;
    }
  }

  checkOuType(parentOu: OuNode) {
    if (parentOu.type === OuType.branch) {
      this.corporateOu.type = OuType.branch;
    } else {
      this.corporateOu.type = "";
    }
  }

  checkBalanceMode(parentOu: any) {
    if (
      (parentOu?.outputBalanceDistributionMode ||
        parentOu?.billingAccount?.outputBalanceDistributionMode) ===
      BalanceDistributionMode.limit
    ) {
      this.corporateOu.billingAccount.outputBalanceDistributionMode =
        BalanceDistributionMode.limit;
    } else {
      this.corporateOu.billingAccount.outputBalanceDistributionMode = "";
    }
  }

  selectAll(values: string[], name: string, formName: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this[formName].form.controls[name].patchValue(selected);
    }
  }

  checkSelectedOu() {
    if (this.corporateOu.parentId) {
      this.stepperComponent.next();
      this.selectedStep = 1;
      this.checkOuType(this.parentOu);
      this.checkBalanceMode(this.parentOu);
      this.getCorporateUsers();
    }
  }

  openConfirmationModal(isAssignAdminFlow = false) {
    this.assignAdminFlow = isAssignAdminFlow;
    this.modalComponent.open("create-unit-modal");
  }

  openCreateUserModal() {
    this.openUserModal = true;
    this.resetCorporateUserForm();
    if (this.createCorporateUserComponent) {
      this.createCorporateUserComponent?.selectOuAdminRole();
      this.createCorporateUserComponent.enableManexGaugeAndUser();
    }
    this.createUserModalComponent.open();
  }

  resetCorporateUserForm() {
    if (this.createCorporateUserComponent) {
      this.createCorporateUserComponent.corporateUser = new User();
      this.createCorporateUserComponent.selectedRoles = [];
      this.createCorporateUserComponent.submitForm.reset();
    }
  }

  onTagRemove(tagToRemove: NbTagComponent): void {
    this.trees = this.trees.filter((t) => t !== tagToRemove.text);
    this.corporateOu.admins = this.corporateOu.admins.filter((u) => {
      if (this.currentLang === "en") {
        return u.enName !== tagToRemove.text;
      } else {
        return u.localeName !== tagToRemove.text;
      }
    });
  }

  goBack() {
    if (this.newCreatedOuId) {
      const refreshToken = sessionStorage.getItem("refreshToken");
      this.authService
        .getRefreshToken(refreshToken)
        .subscribe(async ({ token, refreshTokenDto }) => {
          this.authService.overRideToken(token, refreshTokenDto);
          window.history.back();
        });
    } else {
      if (this.selectedStep == 1) {
        if (this.checkFormSubmission()) {
          this.selectedStep = 0;
        } else if (!this.submitForm.dirty) {
          this.selectedStep = 0;
        } else {
          return;
        }
      } else {
        window.history.back();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
