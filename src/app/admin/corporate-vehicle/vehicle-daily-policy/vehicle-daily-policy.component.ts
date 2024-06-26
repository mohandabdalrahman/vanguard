import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {ColData} from "@models/column-data.model";
import {SubSink} from "subsink";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {removeNullProps} from "@helpers/check-obj";
import {BaseResponse} from "@models/response.model";
import {CorporateVehicle, FuelType, ManualMileage, VehicleType} from "../corporate-vehicle.model";
import {CorporateVehicleService} from "../corporate-vehicle.service";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ActivatedRoute, NavigationStart, Router, RouterEvent} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {Policy} from "@models/policy.model";
import {AssetType} from "@models/asset-type";
import {PolicyService} from "@shared/services/policy.service";
import {NfcTag} from "@models/nfc-tag.model";
import {NfcTagService} from "@shared/services/nfc-tag.service";
import {AssetTag} from "@models/asset-tag";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {User} from "@models/user.model";
import {NgForm} from "@angular/forms";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {NbStepperComponent} from "@nebular/theme/components/stepper/stepper.component";
import {CellData} from "@models/cell-data.model";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {ProductCategory} from "../../product/product-category.model";
import {ProductCategoryService} from "../../product/productCategory.service";
import {AssetPolicyService} from "@shared/services/asset-policy.service";
import {AuthService} from "../../../auth/auth.service";
import {TransactionService} from "@shared/services/transaction.service";
import {LatestTransactionInfo} from "@models/transaction.model";
import {EmitService} from "@shared/services/emit.service";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {filter} from "rxjs/operators";

interface SelectedVehicle extends CorporateVehicle {
  liters?: number;
  kilometers?: number;
  exchangeLimit?: number;
}

@Component({
  selector: 'app-vehicle-daily-policy',
  templateUrl: './vehicle-daily-policy.component.html',
  styleUrls: [
    "../../../scss/list.style.scss",
    './vehicle-daily-policy.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class VehicleDailyPolicyComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("stepper") private stepperComponent: NbStepperComponent;
  @ViewChild("restUsersModal") private restUsersModal: ModalComponent;
  @Input() isManualMileageMode = false;
  @Output() onDateChange = new EventEmitter();
  corporateId: number;
  currentLang: string;
  colData: ColData[] = [];
  defaultSelectedVehicleColData: ColData[] = [
    {field: "type", header: "corporateVehicle.type"},
    {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
    {field: "plateNumber", header: "corporateVehicle.plateNumber"},
    {field: "lastExchangeLimit", header: "corporateVehicle.lastTimeSpent"},
    {field: "lastLiters", header: "corporateVehicle.lastLiters"},
  ];
  selectedVehiclesColData: ColData[] = [
    {field: "status", header: "corporateVehicle.operatingValidity"},
    {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
    {field: "plateNumber", header: "corporateVehicle.plateNumber"},
    {field: "latestTrxItemQuantity", header: "corporateVehicle.litersLastTreatment"},
    {field: "latestTrxDate", header: "corporateVehicle.dateLastTransaction"},
    {field: "inputs", header: "corporateVehicle.enterDailyOperations"},
    {field: "remainingLiters", header: "corporateVehicle.remainingLiters"},
    {field: "startDate", header: "app.startDate"},
    {field: "availableKilometersForLitres", header: "corporateVehicle.availableKilometersForLitres"},
    {field: "lastExchangeLimit", header: "corporateVehicle.lastTimeSpent"},
    {field: "lastLiters", header: "corporateVehicle.lastLiters"},
  ];
  reviewSelectedVehiclesColData: ColData[] = [
    ...this.defaultSelectedVehicleColData,
    {field: "dailyOperationsValues", header: "corporateVehicle.enteredDailyOperations"},
  ];
  manualMileageColData: ColData[] = [
    {field: "type", header: "corporateVehicle.type"},
    {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
    {field: "plateNumber", header: "corporateVehicle.plateNumber"},
    {field: "latestTrxItemQuantity", header: "corporateVehicle.litersLastTreatment"},
    {field: "manualMeterReading", header: "corporateVehicle.enterMeterReading"},
  ];

  mileageColData: ColData[] = [
    {field: "lastDistanceReading", header: "corporateVehicle.lastDistanceReading"},
    {field: "type", header: "corporateVehicle.type"},
    {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
    {field: "plateNumber", header: "corporateVehicle.plateNumber"},
    {field: "users", header: "user.name", clickable: true},
  ]
  gridData: any[] = [];
  ouId: number;
  corporateVehicles: CorporateVehicle[] = [];
  selectedVehicles: SelectedVehicle[] = [];
  totalElements: number;
  vehicleTypes: VehicleType[] = [];
  assignedPolicy: number;
  policies: Policy[] = [];
  nfcTags: NfcTag[];
  fuelTypes: FuelType[] = Object.keys(FuelType).map((key) => FuelType[key]);
  fuelTypesTranslation = [];
  vehicleFuelTypes = new Map();
  assetTags: AssetTag[] = [];
  corporateUsers: User[] = [];
  selectedOuNode: any;
  selectedPolicy: Policy;
  restOfUsers: User[] = [];
  price: number;
  userType: string;
  latestTransactionInfo: LatestTransactionInfo[] = [];
  productCategory: ProductCategory;
  activeStatusCount: number;
  inactiveStatusCount: number;
  manualMileage: ManualMileage[] = [];
  litersSum = 0;
  kilometersSum = 0;
  exchangeLimitSum = 0;
  corporateOu: CorporateOu;

  constructor(
    private corporateOuService: CorporateOuService,
    
    private corporateVehicleService: CorporateVehicleService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    private policyService: PolicyService,
    private nfcTagService: NfcTagService,
    private assetTagService: AssetTagService,
    private productCategoryService: ProductCategoryService,
    private assetPolicyService: AssetPolicyService,
    private authService: AuthService,
    private router: Router,
    private transactionService: TransactionService,
    private emitService: EmitService,
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.selectedOuNode = this.corporateOuService?.getSelectedOuFromStorage();
    this.ouId = this.corporateOuService?.getSelectedOuFromStorage()?.id || this.authService.getOuId() || this.authService.getRootOuId();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
        if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        }
        else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details'))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouId = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouId = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
        }
      }),
      this.emitService.getTableRecord().subscribe(() => {
        this.calculateDailyOperatingValues()
      })
    )
    this.setColData();
    this.fuelTypesTranslation = this.fuelTypes.map((element => {
      return $localize`fuelType.` + element
    }))
    for (let i = 0; i < this.fuelTypes.length; i++) {
      this.vehicleFuelTypes.set(this.fuelTypes[i], this.fuelTypesTranslation[i]);
    }
    this.getCorporateNfc();
    this.getPolicies(this.corporateId, AssetType.Vehicle);
    this.getAssetTags(this.corporateId);
    this.getCorporateUsers(this.corporateId);
    this.getCorporateVehicles(this.corporateId);
    this.getCorporateOuDetails(this.ouId);
  }


  setColData() {
    this.colData = [
      // {field: "status", header: "corporateVehicle.operatingValidity"},
      {field: "latestTrxItemQuantity", header: "corporateVehicle.litersLastTreatment"},
      {field: "latestTrxDate", header: "corporateVehicle.dateLastTransaction"},
      {field: "type", header: "corporateVehicle.type"},
      {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
      {field: "plateNumber", header: "corporateVehicle.plateNumber"},
      {field: "users", header: "user.name", clickable: true},
    ]
  }

  setGridData(data: CorporateVehicle[]) {
    let vehiclesWithoutUsers = []
    data.forEach(async (corporateVehicle) => {
      const latestTrxDate = this.latestTransactionInfo.find(transactionInfo => transactionInfo.assetId === corporateVehicle.id)?.latestTrxDate
      const corporateVehicleData = {
        id: corporateVehicle.id,
        status: !corporateVehicle.suspended ? "active" : "inactive",
        latestTrxItemQuantity: this.latestTransactionInfo.find(transactionInfo => transactionInfo.assetId === corporateVehicle.id)?.latestTrxItemQuantity?.toFixed(2),
        latestTrxDate: latestTrxDate ? new Date(latestTrxDate).toLocaleDateString() : null,
        type:
          this.currentLang === "en"
            ? this.vehicleTypes.find(
            (vehicleType) =>
              vehicleType.id === corporateVehicle.vehicleTypeId
          )?.enName ?? ""
            : this.vehicleTypes.find(
            (vehicleType) =>
              vehicleType.id === corporateVehicle.vehicleTypeId
          )?.localeName ?? "",
        plateNumber: corporateVehicle.plateNumber,
        vehicleCode: corporateVehicle.vehicleCode,
        consumptionDefaultRate: corporateVehicle.consumptionDefaultRate,
        averageCalculatedConsumption: corporateVehicle.averageCalculatedConsumption,
        assetPolicies: corporateVehicle.assetPolicies,
        lastDistanceReading: corporateVehicle.lastDistanceReading
      };

      if (corporateVehicle?.authorizedUserIds?.length > 0) {
        this.subs.add(
          this.corporateUserService
            .getCorporateUsers(this.corporateId, {
              userIds: corporateVehicle.authorizedUserIds,
            })
            .subscribe(
              (corporateUsers) => {
                if (corporateUsers) {
                  this.gridData.push({
                    ...corporateVehicleData,
                    users: (this.currentLang === 'en' ? corporateUsers.content[0]?.enName ?? '' : corporateUsers.content[0]?.localeName ?? '') + (corporateUsers.content?.length > 1 ? `<strong class="remaining-count"> +${corporateUsers.content?.length - 1} </strong>` : ""),
                    restOfUsers: corporateUsers.content?.length > 1 ? corporateUsers.content.slice(1) : null,
                  });
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

      } else {
        vehiclesWithoutUsers.push(corporateVehicleData);
      }
    });
    setTimeout(() => {
      this.gridData = [...this.gridData, ...vehiclesWithoutUsers]
    }, 2000)
  }


  getCorporateVehicles(corporateId: number, searchObj?: CorporateAssetSearch<AssetType.Vehicle>) {
    
    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicles(
          corporateId,
          removeNullProps({
            ouIds: this.ouId ? [this.ouId] : null,
            ...searchObj,
          }),
        )
        .subscribe(
          (corporateVehicles: BaseResponse<CorporateVehicle>) => {
            this.gridData = [];
            if (corporateVehicles.content?.length > 0) {
              this.corporateVehicles = corporateVehicles.content;
              this.totalElements = corporateVehicles.totalElements;
              this.getVehicleTypes();

            } else {
              this.corporateVehicles = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noVehiclesFound", "type.warning"])
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

  getVehicleTypes() {
    
    this.subs.add(
      this.corporateVehicleService
        .getVehicleTypes({suspended: false})
        .subscribe(
          (vehicleTypes: BaseResponse<VehicleType>) => {
            if (vehicleTypes.content?.length > 0) {
              this.vehicleTypes = vehicleTypes.content;
              if (!this.isManualMileageMode) {
                this.getAssetTransactionsInfo(this.corporateVehicles.map(vehicle => vehicle.id))
              } else {
                this.setGridData(this.corporateVehicles);
              }
            } else {
              this.translate
                .get(["error.noVehicleTypesFound", "type.warning"])
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
        .getUnsuspendedPolicies(corporateId, removeNullProps({
          assetType,
          policyType: 'DYNAMIC',
          ouIds: this.ouId ? [this.ouId] : null,
          suspended: false
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

  getCorporateNfc() {
    
    this.subs.add(
      this.nfcTagService.getNfcTags(this.corporateId).subscribe(
        (nfcTag: BaseResponse<NfcTag>) => {
          if (nfcTag.content) {
            this.nfcTags = nfcTag.content;
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
        .getCorporateUsers(corporateId, {suspended: false})
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

  handleSearch() {
    if (this.submitForm?.value) {
      this.getCorporateVehicles(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporateVehicles(this.corporateId);
    }
  }

  getSelectedVehicles(vehicles: CorporateVehicle[]) {
    if (vehicles.length) {
      this.selectedVehicles = vehicles;
    } else {
      this.selectedVehicles = [];
    }
  }


  getProductCategory(productCategoryId: number) {
    
    this.subs.add(
      this.productCategoryService.getProduct(productCategoryId).subscribe(
        (productCategory: ProductCategory) => {
          if (productCategory) {
            this.productCategory = productCategory;
            this.price = productCategory.price;
            this.stepperComponent.next();
            this.buildSelectedVehiclesObj()
          } else {
            this.translate.get(["error.noProductCategoriesFound", "type.warn" +
            "ing"]).subscribe(
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

  goToNextStep() {
    if (this.isManualMileageMode) {
      this.stepperComponent.next();
    }
    this.selectedPolicy = this.policies.find(policy => policy.id === this.assignedPolicy);
    if (this.selectedPolicy?.productCategoryId) {
      this.getProductCategory(this.selectedPolicy?.productCategoryId)
    }
  }


  buildSelectedVehiclesObj() {
    this.activeStatusCount = 0;
    this.inactiveStatusCount = 0;
    this.selectedVehicles = this.selectedVehicles.map((vehicle) => {
      const assetPolicy = vehicle?.assetPolicies?.find(policy => {
        return policy.policyId === this.assignedPolicy
      })
      const lastExchangeLimit = assetPolicy?.remainingAmount ? +assetPolicy.remainingAmount + assetPolicy.cycleConsumption : null
      const lastLiters = assetPolicy && lastExchangeLimit ? lastExchangeLimit / this.price : null
      const nowDate = new Date();
      const startDate = new Date(assetPolicy?.startDate);
      const endDate = new Date(assetPolicy?.endDate);

      return {
        ...vehicle,
        operatingValidity: !assetPolicy ? 'notFound' : nowDate >= startDate && nowDate <= endDate ? "active" : "inactive",
        startDate: assetPolicy?.startDate,
        lastExchangeLimit,
        lastLiters,
        liters: null,
        kilometers: vehicle.kilometers,
        exchangeLimit: lastExchangeLimit,
        assignedPolicyProductCategoryId: this.selectedPolicy?.productCategoryId,
      }
    });

    this.activeStatusCount = this.selectedVehicles.filter(vehicle => vehicle['operatingValidity'] === 'active').length;
    this.inactiveStatusCount = this.selectedVehicles.filter(vehicle => vehicle['operatingValidity'] === 'inactive' || vehicle['operatingValidity'] === 'notFound').length;
    this.calculateDailyOperatingValues();
  }

  calculateDailyOperatingValues() {
    this.litersSum = this.selectedVehicles.reduce((acc, vehicle) => {
      return acc + ((+vehicle['liters'] || +vehicle['lastLiters']) ?? 0)
    }, 0)

    setTimeout(()=>{
      this.kilometersSum = this.selectedVehicles.reduce((acc, vehicle) => {
        return acc + ((+vehicle['kilometers'] ?? 0))
      }, 0)
    },100)

    this.exchangeLimitSum = this.selectedVehicles.reduce((acc, vehicle) => {
      return acc + ((+vehicle['exchangeLimit'] ?? 0))
    }, 0)
  }

  goToPreviewStep() {
    if (this.checkSelectedVehiclesValues()) {
      this.stepperComponent.next();
    } else {
      this.translate
        .get(["error.enterDailyOperationsValues", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  checkSelectedVehiclesValues() {
    return this.selectedVehicles.every((vehicle) => (vehicle.liters != null && vehicle.kilometers != null && vehicle.exchangeLimit != null))
  }

  handleCellClick(cellData: CellData) {
    if (cellData.field === 'users' && cellData?.data?.restOfUsers?.length) {
      this.restOfUsers = cellData?.data?.restOfUsers
      this.restUsersModal.open()
    } else {
      this.restOfUsers = []
    }
  }

  assignDynamicPolicy() {
    
    const dynamicPolicies = this.selectedVehicles.map((vehicle) => {
      return {
        assetId: vehicle.id,
        policyId: this.selectedPolicy.id,
        policyAssetType: AssetType.Vehicle,
        remainingAmount: vehicle.exchangeLimit,
      }
    })
    this.subs.add(
      this.assetPolicyService.assignDynamicPolicies(this.corporateId, this.selectedPolicy.id, dynamicPolicies).subscribe(
        () => {
          this.translate
            .get("success.dynamicPolicyAssigned")
            .subscribe((msg) => {
              this.handleSuccessResponse(msg);
            });
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  handleSuccessResponse(msg: string) {
    if (this.userType === 'admin') {
      this.router.navigate([`/admin/corporates/${this.corporateId}/details/vehicles`])
    } else if (this.userType === 'corporate') {
      this.router.navigate([`/corporate/vehicles`])
    }
    this.toastr.success(msg);
  }

  getAssetTransactionsInfo(assetIds: number[]) {
    
    this.subs.add(
      this.transactionService.getAssetTransactionsInfo(this.corporateId, assetIds).subscribe(
        (transactionsInfo: LatestTransactionInfo[]) => {
          if (transactionsInfo?.length > 0) {
            this.latestTransactionInfo = transactionsInfo
          }
          
          this.setGridData(this.corporateVehicles);
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  emitDate(date: string) {
    this.onDateChange.emit(date)
  }

  updateManualMileage() {
    
    this.manualMileage = this.selectedVehicles.map((vehicle) => {
      return {
        assetId: vehicle.id,
        lastMileage: vehicle.lastDistanceReading,
        currentMileage: +vehicle.kilometers,
      }
    })
    this.subs.add(
      this.corporateVehicleService.updateManualMileage(this.corporateId, this.manualMileage).subscribe(
        () => {
          this.translate
            .get("success.manualMileageUpdated")
            .subscribe((msg) => {
              this.handleSuccessResponse(msg);
            });
          
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
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
