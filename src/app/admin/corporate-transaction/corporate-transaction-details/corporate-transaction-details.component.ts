import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation,} from "@angular/core";
import {SubSink} from "subsink";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {removeUnNeededProps} from "@helpers/remove-props";
import {TransactionService} from "@shared/services/transaction.service";
import {
  Status,
  Transaction,
  TransactionItem,
  TransactionItemData,
  TransactionMileage,
} from "@models/transaction.model";
import {AuthService} from "../../../auth/auth.service";
import {SiteService} from "@shared/sites/site.service";
import { forkJoin} from "rxjs";
import {MerchantService} from "../../merchants/merchant.service";
import {CorporateService} from "../../corporates/corporate.service";
import {CorporateUserService} from "../../corporate-user/corporate-user.service";
import {ColData} from "@models/column-data.model";
import {ProductCategoryService} from "../../product/productCategory.service";
import {CorporatePolicyService} from "../../corporate-policy/corporate-policy.service";
import {MerchantProductService} from "@shared/merchant-products/merchant-product.service";
import {AssetTypeService} from "@shared/services/asset-type.service";
import {CorporateVehicleService} from "../../corporate-vehicle/corporate-vehicle.service";
import {CorporateHardwareService} from "../../corporate-hardware/corporate-hardware.service";
import {CorporateContainerService} from "../../corporate-container/corporate-container.service";
import {AssetType} from "@models/asset-type";
import {MileageService} from "@shared/services/mileage.service";
import {CorporateCardService} from "@shared/services/corporate-card.service";
import {Card} from "@models/card.model";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import { MerchantUserService } from "@shared/merchant-users/merchant-user.service";


@Component({
  selector: "app-corporate-transaction-details",
  templateUrl: "./corporate-transaction-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-transaction-details.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CorporateTransactionDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("download") download;
  @ViewChild("mileageModal") mileageModal: ModalComponent;
  currentLang: string;
  transactionId: number;
  userType: string;
  transaction: Transaction;
  gridData: any[] = [];
  colData: ColData[] = [];
  transactionItemData: TransactionItemData[] = [];
  mileageFile;
  assetType: AssetType;
  recordData: TransactionItemData;
  mileageNumber: number;
  merchantId: number;
  corporateId: number;
  isTabView = false;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private siteService: SiteService,
    private merchantService: MerchantService,
    private corporateService: CorporateService,
    private corporateUserService: CorporateUserService,
    private corporateCardService: CorporateCardService,
    private productCategoryService: ProductCategoryService,
    private corporatePolicyService: CorporatePolicyService,
    private merchantProductService: MerchantProductService,
    private assetTypeService: AssetTypeService,
    private corporateVehicleService: CorporateVehicleService,
    private corporateHardwareService: CorporateHardwareService,
    private corporateContainerService: CorporateContainerService,
    private mileageService: MileageService,
    private corporateOuService: CorporateOuService,
    private merchantUserService: MerchantUserService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.assetType);
        this.setGridData(this.transactionItemData);
      }),
      this.route.params.subscribe((params) => {
        this.transactionId = params["transactionId"];
      })
    );
    if (this.transactionId) {
      this.getTransactionDetails(this.transactionId);
    }
  }

  setColData(assetType: string) {
    const commonColData = [
      {field: "id", header: "app.id"},
      {field: "productName", header: "transaction.productName"},
      {field: "productCategory", header: "transaction.productCategory"},
      {field: "policyName", header: "transaction.policyName"},
      {field: "assetId", header: "transaction.assetId"},
      {field: "assetType", header: "transaction.assetType"},
      {field: "netAmount", header: "transaction.netAmount"},
      {field: "vatAmount", header: "transaction.vatAmount"},
      {field: "amount", header: "transaction.amount"},
      {field: "quantity", header: "transaction.quantity"},
      {field: "unitPrice", header: "transaction.unitPrice"},
    ];
    if (assetType === AssetType.Container) {
      this.colData = [
        ...commonColData,
        {field: "containerId", header: "transaction.containerId"},
      ];
    } else if (assetType === AssetType.Hardware) {
      this.colData = [
        ...commonColData,
        {field: "hardwareId", header: "transaction.hardwareId"},
      ];
    } else if (assetType === AssetType.Vehicle) {
      this.colData = [
        ...commonColData,
        {field: "plateNumber", header: "transaction.plateNumber"},
        {field: "currentMileage", header: "transaction.currentMileage"},
      ];
    } else {
      this.colData = this.colData.length ? [...this.colData] : [...commonColData];
    }
  }

  setGridData(data: TransactionItemData[]) {
    this.gridData = data.map((transaction) => {
      return {
        id: transaction.id,
        productName:
          this.currentLang === "en"
            ? transaction.product.enName
            : transaction.product.localeName,
        productCategory:
          this.currentLang === "en"
            ? transaction.productCategory.enName
            : transaction.productCategory.localeName,
        policyName:
          this.currentLang === "en"
            ? transaction.policy.enName
            : transaction.policy.localeName,
        amount: transaction.amount,
        vatAmount: transaction.vatAmount,
        netAmount: transaction.vatAmount
          ? transaction.amount - transaction.vatAmount
          : transaction.amount,
        quantity: transaction.quantity.toFixed(2),
        unitPrice: transaction.unitPrice,
        containerId: transaction.containerId,
        hardwareId: transaction.hardwareId,
        plateNumber: transaction.plateNumber,
        currentMileage: transaction.currentMileage,
        assetId: transaction.assetId,
        assetType: $localize`assetType.` + transaction.assetType,
      };
    });
  }

  getTransactionDetails(transactionId: number): void {
    
    this.subs.add(
      this.transactionService.getTransaction(transactionId).subscribe(
        (transaction: Transaction) => {
          if (transaction) {
            const {
              id,
              transactionItems,
              status,
              cardHolderNfcId,
              cardHolderId,
              merchantId,
              corporateId,
              siteId,
              salesPersonId,
              ouId,
              ...other
            } = removeUnNeededProps(transaction, [
              "lastModifiedDate",
              "statusReason",
              "shiftId",
              "otuId",
              "settled",
              "commissionAmount",
            ]);
            this.transaction = other;
            this.merchantId = merchantId;
            this.corporateId = corporateId;
            this.setStatus(status);
            this.subs.add(
              this.translate.onLangChange.subscribe(() => {
                this.setStatus(status);
              })
            );
            this.getMileageFileName(merchantId, siteId, id);
            this.getTransactionData(transaction);
            this.getCorporateUser(corporateId, cardHolderId);
            this.getCorporateCard(corporateId, cardHolderNfcId);
            transactionItems.forEach((item) => {
              this.getTransactionItemDetails(corporateId, merchantId, item);
            });
          } else {
            this.translate
              .get(["error.transactionNotFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          // 
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  setStatus(status: string) {
    if (this.currentLang === "en") {
      this.transaction.status = status;
    } else {
      if (status === Status.successEn) {
        this.transaction.status = Status.successAr;
      } else if (status === Status.failureEn || status === Status.failureEn2) {
        this.transaction.status = Status.failureِAr;
      }
    }
  }

  getTransactionData(transaction: Transaction) {
    
    const sources: any = [
      this.corporateService.getCorporate(transaction.corporateId),
      this.merchantService.getMerchant(transaction.merchantId),
      this.siteService.getMerchantSite(
        transaction.merchantId,
        transaction.siteId
      ),
      transaction?.ouId && (this.authService.isOuEnabled() || this.userType === "admin") && this.corporateOuService.
      getCorporateOuDetails(transaction.corporateId, transaction.ouId),
      this.userType === "admin" && this.merchantUserService.getMerchantUser(
        transaction.merchantId,
        transaction.salesPersonId
        )
    ].filter(Boolean)

    
    this.subs.add(
      forkJoin(sources).subscribe(
        ([corporate, merchant, site ,  ou ,salesPerson ]) => {
          
          this.handleLangChange(corporate, merchant, site, ou, salesPerson);
          this.subs.add(
            this.translate.onLangChange.subscribe(() => {
              this.handleLangChange(corporate, merchant, site, ou, salesPerson);
            })
          );
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  handleLangChange(corporate, merchant, site, ou, salesPerson) {
    this.transaction["corporateName"] =
      this.currentLang === "en" ? corporate.enName : corporate.localeName;
    this.transaction["merchantName"] =
      this.currentLang === "en" ? merchant.enName : merchant.localeName;
    this.transaction["siteName"] =
      this.currentLang === "en" ? site.enName : site.localeName;
      this.transaction["ouName"] =
        this.currentLang === "en" ? ou?.enName : ou?.localeName;
      if(salesPerson){
        this.transaction["salesPerson"] =
      this.currentLang === "en" ? salesPerson.enName : salesPerson.localeName;
      }
  }

  getCorporateUser(corporateId: number, corporateUserId: number) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUser(corporateId, corporateUserId)
        .subscribe(
          (corporateUser) => {
            if (corporateUser) {
              this.transaction["cardHolderName"] =
                this.currentLang === "en"
                  ? corporateUser.enName
                  : corporateUser.localeName;
              this.subs.add(
                this.translate.onLangChange.subscribe(() => {
                  this.transaction["cardHolderName"] =
                    this.currentLang === "en"
                      ? corporateUser.enName
                      : corporateUser.localeName;
                })
              );
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

  getCorporateCard(corporateId: number, cardHolderNfcId: number) {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCard(corporateId, cardHolderNfcId)
        .subscribe(
          (corporateCard: Card) => {
            if (corporateCard) {
              this.transaction["cardHolderCardSerial"] = parseInt(
                corporateCard.serialNumber,
                16
              );
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getMileageFileName(merchantId: number, siteId: number, trxId: number) {
    
    this.subs.add(
      this.mileageService
        .getMileageFileName(merchantId, siteId, trxId)
        .subscribe(
          (mileageFileName) => {
            if (mileageFileName.length > 0) {
              this.downloadMileageFileName(
                merchantId,
                siteId,
                trxId,
                mileageFileName[0].fileName
              );
            } else {
              this.translate
                .get(["error.noMileageImageFound", "type.warning"])
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

  downloadMileageFileName(
    merchantId: number,
    siteId: number,
    trxId: number,
    fileName: string
  ) {
    
    this.subs.add(
      this.mileageService
        .downloadMileageFileName(merchantId, siteId, trxId, fileName)
        .subscribe(
          (response) => {
            if (response) {
              this.mileageFile = response;
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getTransactionItemDetails(
    corporateId: number,
    merchantId: number,
    item: TransactionItem
  ) {
    
    this.subs.add(
      forkJoin([
        this.assetTypeService.getAssetType(item.assetNfcId),
        this.productCategoryService.getProduct(item.productCategoryId),
        this.merchantProductService.getMerchantProduct(
          merchantId,
          item.productId
        ),
        this.corporatePolicyService.getCorporatePolicy(
          corporateId,
          item.policyId
        ),
      ]).subscribe(
        ([assetType, productCategory, product, policy]) => {
          
          const commonTransactionItem = {
            id: item.id,
            product,
            productCategory,
            policy,
            amount: item.amount,
            vatAmount: item.vatAmount,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            assetId: item.assetId,
          };
          if (assetType) {
            if (assetType === AssetType.Vehicle) {
              this.subs.add(
                this.corporateVehicleService
                  .getCorporateVehicle(corporateId, item.assetId)
                  .subscribe(
                    (vehicle) => {
                      if (vehicle) {
                        this.setTransactionData(
                          {
                            ...commonTransactionItem,
                            plateNumber: vehicle.plateNumber,
                            currentMileage: item.currentMileage,
                          },
                          AssetType.Vehicle
                        );
                      }
                    },
                    (err) => {
                      this.errorService.handleErrorResponse(err);
                    }
                  )
              );
            } else if (assetType === AssetType.Container) {
              this.subs.add(
                this.corporateContainerService
                  .getCorporateContainer(corporateId, item.assetId)
                  .subscribe(
                    (container) => {
                      if (container) {
                        this.setTransactionData(
                          {
                            ...commonTransactionItem,
                            containerId: container.id,
                          },
                          AssetType.Container
                        );
                      }
                    },
                    (err) => {
                      this.errorService.handleErrorResponse(err);
                    }
                  )
              );
            } else if (assetType === AssetType.Hardware) {
              this.subs.add(
                this.corporateHardwareService
                  .getCorporateHardware(corporateId, item.assetId)
                  .subscribe(
                    (hardware) => {
                      if (hardware) {
                        this.setTransactionData(
                          {
                            ...commonTransactionItem,
                            hardwareId: hardware.id,
                          },
                          AssetType.Hardware
                        );
                      }
                    },
                    (err) => {
                      this.errorService.handleErrorResponse(err);
                    }
                  )
              );
            } else {
              this.setTransactionData(
                {
                  ...commonTransactionItem,
                },
                AssetType.User
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

  setTransactionData(data: TransactionItemData, assetType: AssetType) {
    this.assetType = assetType;
    this.setColData(assetType);
    this.transactionItemData.push({
      ...data,
      assetType,
    });
    this.setGridData(this.transactionItemData);
  }

  openMileageModal(recordData: TransactionItemData) {
    this.recordData = recordData;
    this.mileageNumber = null;
    this.mileageModal.open();
  }

  submitMileageNumber() {
    
    if (!isNaN(this.mileageNumber)) {
      const mileageData: TransactionMileage = {
        corporateId: this.corporateId,
        merchantId: this.merchantId,
        newMileageReading: this.mileageNumber,
        oldMileageReading: this.recordData?.currentMileage
      };
      this.subs.add(
        this.transactionService.updateTransactionMileage(this.transactionId, this.recordData.id, mileageData).subscribe(() => {
          
          this.mileageModal.closeModal();
          location.reload();
        }, (err) => {
          this.errorService.handleErrorResponse(err);
        })
      );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
