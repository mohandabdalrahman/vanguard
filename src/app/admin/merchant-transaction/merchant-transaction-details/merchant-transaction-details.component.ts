import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { SubSink } from "subsink";
import { ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { removeUnNeededProps } from "@helpers/remove-props";
import { TransactionService } from "@shared/services/transaction.service";
import {
  Status,
  Transaction,
  TransactionItem,
  TransactionItemData,
} from "@models/transaction.model";
import { AuthService } from "../../../auth/auth.service";
import { SiteService } from "@shared/sites/site.service";
import { forkJoin } from "rxjs";
import { MerchantService } from "../../merchants/merchant.service";
import { CorporateService } from "../../corporates/corporate.service";
import { ColData } from "@models/column-data.model";
import { ProductCategoryService } from "../../product/productCategory.service";
import { MerchantProductService } from "@shared/merchant-products/merchant-product.service";
import { MerchantUserService } from "@shared/merchant-users/merchant-user.service";
import { MileageService } from "@shared/services/mileage.service";

@Component({
  selector: "app-merchant-transaction-details",
  templateUrl: "./merchant-transaction-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./merchant-transaction-details.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MerchantTransactionDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("download") download;
  currentLang: string;
  transactionId: number;
  userType: string;
  transaction: Transaction;
  gridData: any[] = [];
  colData: ColData[] = [];
  transactionItemData: TransactionItemData[] = [];
  mileageFile;
  

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
    private productCategoryService: ProductCategoryService,
    private merchantProductService: MerchantProductService,
    private merchantUserService: MerchantUserService,
    private mileageService: MileageService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.transactionId = params["transactionId"];
      })
    );
    if (this.transactionId) {
      this.getTransactionDetails(this.transactionId);
    }
  }

  setColData() {
    //const commonColData = [
    this.colData = [
      { field: "id", header: "app.id" },
      { field: "productName", header: "transaction.productName" },
      { field: "productCategory", header: "transaction.productCategory" },
      //{field: "policyName", header: "transaction.policyName"},
      { field: "amount", header: "transaction.amount" },
      { field: "quantity", header: "transaction.quantity" },
      { field: "unitPrice", header: "transaction.unitPrice" },
    ];
    // if (assetType === AssetType.Container) {
    //   this.colData = [
    //     ...commonColData,
    //     {field: "containerId", header: "transaction.containerId"},
    //   ];
    // } else if (assetType === AssetType.Hardware) {
    //   this.colData = [
    //     ...commonColData,
    //     {field: "hardwareId", header: "transaction.hardwareId"},
    //   ];
    // } else if (assetType === AssetType.Vehicle) {
    //   this.colData = [
    //     ...commonColData,
    //     {field: "plateNumber", header: "transaction.plateNumber"},
    //     {field: "currentMileage", header: "transaction.currentMileage"},
    //   ];
    // } else {
    //   this.colData = [
    //     ...commonColData];
    // }
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
        // policyName: this.currentLang === "en"
        //   ? transaction.policy.enName
        //   : transaction.policy.localeName,
        amount: transaction.amount,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        //containerId: transaction.containerId,
        //hardwareId: transaction.hardwareId,
        //plateNumber: transaction.plateNumber,
        //currentMileage: transaction.currentMileage
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
              cardHolderId,
              merchantId,
              corporateId,
              siteId,
              ...other
            } = removeUnNeededProps(transaction, [
              "creationDate",
              "lastModifiedDate",
              "statusReason",
              "shiftId",
              "otuId",
              "settled",
              "commissionAmount",
              "totalAmount",
              "cardHolderId",
              "cardHolderNfcId",
            ]);
            this.transaction = other;
            this.setStatus(status);
            this.subs.add(
              this.translate.onLangChange.subscribe(() => {
                this.setStatus(status);
              })
            );
            if (merchantId && siteId && id) {
               this.getMileageFileName(merchantId, siteId, id)
             }
            if (merchantId && corporateId && siteId) {
              this.getTransactionData(transaction);
            }
            // if (corporateId && cardHolderId) {
            //   this.getCorporateUser(corporateId, cardHolderId)
            // }
            if (transactionItems.length > 0 && corporateId && merchantId) {
              transactionItems.forEach((item) => {
                this.getTransactionItemDetails(merchantId, item);
              });
            }
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
      } else if (status === Status.failureEn) {
        this.transaction.status = Status.failureِAr;
      }
    }
  }

  getTransactionData(transaction: Transaction) {
    
    this.subs.add(
      forkJoin([
        this.corporateService.getCorporate(transaction.corporateId),
        this.merchantService.getMerchant(transaction.merchantId),
        this.siteService.getMerchantSite(
          transaction.merchantId,
          transaction.siteId
        ),
        this.merchantUserService.getMerchantUser(
          transaction.merchantId,
          transaction.salesPersonId
        ),
      ]).subscribe(
        ([corporate, merchant, site, merchantUser]) => {
          
          this.handleLangChange(corporate, merchant, site, merchantUser);
          this.subs.add(
            this.translate.onLangChange.subscribe(() => {
              this.handleLangChange(corporate, merchant, site, merchantUser);
            })
          );
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  handleLangChange(corporate, merchant, site, merchantUser) {
    this.transaction["corporateName"] =
      this.currentLang === "en" ? corporate.enName : corporate.localeName;
    this.transaction["merchantName"] =
      this.currentLang === "en" ? merchant.enName : merchant.localeName;
    this.transaction["siteName"] =
      this.currentLang === "en" ? site.enName : site.localeName;
    this.transaction["salesPerson"] =
      this.currentLang === "en" ? merchantUser.enName : merchantUser.localeName;
  }

  // getCorporateUser(corporateId: number, corporateUserId: number) {
  //   
  //   this.subs.add(
  //     this.corporateUserService
  //       .getCorporateUser(corporateId, corporateUserId)
  //       .subscribe(
  //         (corporateUser) => {
  //           if (corporateUser) {
  //             this.transaction['cardHolderName'] = corporateUser.enName
  //           } else {
  //             this.translate.get(["error.noUsersFound", "type.warning"]).subscribe(
  //               (res) => {
  //                 this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
  //               }
  //             );
  //           }
  //           
  //         },
  //         (err) => {
  //           this.errorService.handleErrorResponse(err);
  //         }
  //       )
  //   );
  // }

  getMileageFileName(merchantId: number, siteId: number, trxId: number) {
  //   
    this.subs.add(
      this.mileageService
        .getMileageFileName(merchantId, siteId, trxId)
        .subscribe(
          (mileageFileName) => {
            if (mileageFileName.length > 0) {
              this.downloadMileageFileName(merchantId, siteId, trxId, mileageFileName[0].fileName)
            } else {
              this.toastr.warning(
                `No mileage file found for transaction`
              );
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  downloadMileageFileName(merchantId: number, siteId: number, trxId: number, fileName: string) {
    
    this.subs.add(
      this.mileageService
        .downloadMileageFileName(merchantId, siteId, trxId, fileName)
        .subscribe(
          (response) => {
            if (response) {
              this.mileageFile = response
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getTransactionItemDetails(
    merchantId: number,
    item: TransactionItem
  ) {
    
    this.subs.add(
      forkJoin([
        this.productCategoryService.getProduct(item.productCategoryId),
        this.merchantProductService.getMerchantProduct(
          merchantId,
          item.productId
        ),
        //this.corporatePolicyService.getCorporatePolicy(corporateId, item.productCategoryId),
        //this.assetTypeService.getAssetType(item.assetNfcId),
      ]).subscribe(
        ([productCategory, product]) => {
          
          const commonTransactionItem = {
            id: item.id,
            product,
            productCategory,
            amount: item.amount,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
          this.setTransactionData({ ...commonTransactionItem });

          //           if (assetType === AssetType.Vehicle) {
          //   this.subs.add(
          //     this.corporateVehicleService
          //       .getCorporateVehicle(corporateId, item.assetId).subscribe(vehicle => {
          //       this.setTransactionData({
          //         ...commonTransactionItem,
          //         plateNumber: vehicle.plateNumber,
          //         currentMileage: item.currentMileage
          //       }, AssetType.Vehicle)
          //     }, err => {
          //       this.errorService.handleErrorResponse(err);
          //     })
          //   )
          // } else if (assetType === AssetType.Container) {
          //   this.subs.add(
          //     this.corporateContainerService
          //       .getCorporateContainer(corporateId, item.assetId)
          //       .subscribe(container => {
          //         this.setTransactionData({
          //           ...commonTransactionItem,
          //           containerId: container.id,
          //         }, AssetType.Container)
          //       }, err => {
          //         this.errorService.handleErrorResponse(err);
          //       })
          //   )
          // } else if (assetType === AssetType.Hardware) {
          //   this.subs.add(
          //     this.corporateHardwareService
          //       .getCorporateHardware(corporateId, item.assetId)
          //       .subscribe(hardware => {
          //         this.setTransactionData({
          //           ...commonTransactionItem,
          //           hardwareId: hardware.id,
          //         }, AssetType.Hardware)
          //       }, err => {
          //         this.errorService.handleErrorResponse(err);
          //       })
          //   )
          // } else {
          //   this.setTransactionData({
          //     ...commonTransactionItem
          //   }, AssetType.User)
          // }
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  setTransactionData(data: TransactionItemData) {
    this.setColData();
    this.transactionItemData.push({
      ...data,
    });
    this.setGridData(this.transactionItemData);
    this.translate.onLangChange.subscribe(() => {
      this.setGridData(this.transactionItemData);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
