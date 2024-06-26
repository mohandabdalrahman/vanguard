import { CorporateService } from "./../../corporates/corporate.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { BaseResponse } from "@models/response.model";
import {
  AcceptedTransaction,
  RejectReason,
  RejectedTransaction,
  ReviewStatus,
  Transaction,
  TransactionsTips,
  VehicleDistance,
  ReviewedTransction,
} from "@models/transaction.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { MileageService } from "@shared/services/mileage.service";
import { TransactionService } from "@shared/services/transaction.service";
import { MerchantSite } from "@shared/sites/site.model";
import { SiteService } from "@shared/sites/site.service";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { Merchant } from "app/admin/merchants/merchant.model";
import { MerchantService } from "app/admin/merchants/merchant.service";

import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import { SubSink } from "subsink";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { ProductCategoryService } from "app/admin/product/productCategory.service";
import { MerchantUserService } from "@shared/merchant-users/merchant-user.service";

@Component({
  selector: "app-admin-transaction-review",
  templateUrl: "./admin-transaction-review.component.html",
  styleUrls: ["./admin-transaction-review.component.scss"],
})
export class AdminTransactionReviewComponent implements OnInit {
  private subs = new SubSink();
  @ViewChild("confirmReview") confirmModalComponent: ModalComponent;
  corporateId: number;
  currentLang: string;
  currentPage: number = 0;
  merchantsTransaction: Merchant[] = [];
  merchant: Merchant;
  sitesTransaction: MerchantSite[] = [];
  site: MerchantSite;
  rejectReasons: RejectReason[] = [];
  cTransaction: ReviewedTransction;
  transactionReviewLog: any[] = [];
  transactionsVehicleDistance: VehicleDistance[] = [];
  newTipsOnTransactions: TransactionsTips = {};
  tipsOnTransactions = [];
  CoporatesName = [];
  productCategoryNames = [];
  salesPersonName: any;
  mileageFileFound: boolean;
  mileageFile;
  confirmRejectAndTips: boolean = false;
  confirmAccept: boolean = false;
  isTipsAllowed: boolean;
  newAmount: number;
  newReadingMileage: number;
  reviewNotes: string;
  rejectionReasonIds: number[] = [];
  isChecked: boolean = false;
  trxTipsValue: boolean;
  isGoBack: boolean = true;
  showImg: boolean = false;
  UnreviewedTransctionList: ReviewedTransction[] = [];
  reviewedTransctionList = [];
  trxIndex = 0;
  constructor(
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private mileageService: MileageService,
    private transactionService: TransactionService,
    private modalService: NgbModal,
    private CorporateService: CorporateService,
    private router: Router,
    private productCategoryService: ProductCategoryService,
    private merchantUserService: MerchantUserService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      })
    );
    this.getRejectReasons();
    this.getUnreviewedTransactions();
  }

  getRejectReasons() {
    this.subs.add(
      this.transactionService.getRejectReasons().subscribe(
        (rejectReasons) => {
          if (rejectReasons.content?.length > 0) {
            this.rejectReasons = rejectReasons.content;
          }
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getUnreviewedTransactions() {
    this.subs.add(
      this.transactionService
        .getUnreviewedTransactions(
          this.reviewedTransctionList == null ||
            this.reviewedTransctionList == undefined ||
            this.reviewedTransctionList?.length == 0
            ? true
            : false,
          10
        )
        .subscribe(
          (transactions: BaseResponse<Transaction>) => {
            if (transactions.content?.length > 0) {
              this.getTransactionDetailsData(transactions.content);
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

  getTransactionDetailsData(transactions: Transaction[]) {
    forkJoin([
      this.siteService.getSiteList({
        ids: transactions.map((t) => t.siteId),
      }),
      this.merchantService.getMerchants({
        ids: transactions.map((t) => t.merchantId),
      }),
      this.transactionService.getTipsList(
        {
          transactionIds: transactions.map((t) => t.id),
          trxType: "ADD",
          tipStatus: "IN_REVIEW",
        },
        0,
        transactions.length
      ),

      this.CorporateService.getCorporates({
        ids: transactions.map((t) => t.corporateId),
      }),
      this.productCategoryService.getProducts({
        ids: transactions.map((t) => t.transactionItems[0].productCategoryId),
      }),
    ]).subscribe(
      ([
        sitesTransaction,
        merchantsTransaction,
        tips,
        coporateName,
        productName,
      ]) => {
        this.sitesTransaction.push(...sitesTransaction.content);
        this.merchantsTransaction.push(...merchantsTransaction.content);
        this.tipsOnTransactions.push(...tips.content);
        this.CoporatesName.push(...coporateName.content);
        this.productCategoryNames.push(...productName.content);
        this.newTransaction(transactions);
      }
    );
  }
  newTransaction(transactions) {
    if (this.UnreviewedTransctionList.length > 0) {
      this.toastr.warning("there is a transaction that has not been Reviewed");
      return;
    }
    transactions?.map((trx) => {
      this.UnreviewedTransctionList.push({
        trxId: trx.id,
        trxData: {
          amount: trx.amount,
          uuid: trx.uuid,
          merchantId: trx.merchantId,
          salesPersonId: trx.salesPersonId,
          siteId: trx.siteId,
          creationDate: trx.creationDate,
          corporateId: trx.corporateId,
          merchantName: {
            en: this.merchantsTransaction.find((m) => m.id == trx.merchantId)
              .enName,
            ar: this.merchantsTransaction.find((m) => m.id == trx.merchantId)
              .localeName,
          },
          siteName: {
            en: this.sitesTransaction.find((s) => s.id == trx.siteId).enName,
            ar: this.sitesTransaction.find((s) => s.id == trx.siteId)
              .localeName,
          },
          productCategoryName: {
            en: this.productCategoryNames.find(
              (p) => p.id == trx.transactionItems[0].productCategoryId
            ).enName,
            ar: this.productCategoryNames.find(
              (p) => p.id == trx.transactionItems[0].productCategoryId
            ).localeName,
          },
          corporateName: {
            en: this.CoporatesName.find((s) => s.id == trx.corporateId).enName,
            ar: this.CoporatesName.find((s) => s.id == trx.corporateId)
              .localeName,
          },
          transactionItems: trx.transactionItems,
        },
        tips: {
          tipsObject: this.tipsOnTransactions.find(
            (t) => t.transactionId == trx.id
          ),
          hasTips: this.tipsOnTransactions.find(
            (t) => t.transactionId == trx.id
          )
            ? true
            : false,
        },
      });
    });
    this.ResetTranasction(this.UnreviewedTransctionList[0]);
  }

  ResetTranasction(transaction: any) {
    this.cTransaction = transaction;
    this.confirmAccept = false;
    this.confirmRejectAndTips = false;
    this.isChecked = false;
    this.rejectionReasonIds = [];
    this.reviewNotes = null;
    this.trxTipsValue = true;
    this.newAmount = null;
    this.newReadingMileage = null;
    this.showImg = false;
    this.isTipsAllowed = this.cTransaction.tips.hasTips;
    this.getMileageFileName(
      this.cTransaction.trxData.merchantId,
      this.cTransaction.trxData.siteId,
      this.cTransaction.trxId
    );
    this.getSalesPersonName(
      this.cTransaction.trxData.merchantId,
      this.cTransaction.trxData.salesPersonId
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
              this.mileageFileFound = true;
            } else {
              this.mileageFileFound = false;
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
  getSalesPersonName(id, userId) {
    this.subs.add(
      this.merchantUserService.getMerchantUser(id, userId).subscribe(
        (res) => {
          this.salesPersonName = {
            en: res.enName,
            ar: res.localeName,
          };
        },
        () => {
          this.salesPersonName = null;
        }
      )
    );
  }
  nextTransaction() {
    if (!this.validateInput()) {
      return;
    }
    const updateExisting=this.trxIndex<this.reviewedTransctionList.length?true:false;
    this.addTransactionToReviewedList(updateExisting);
    if (!updateExisting) {
      this.trxIndex++;
      if (this.UnreviewedTransctionList.length) {
        this.ResetTranasction(this.UnreviewedTransctionList[0]);
      } else {
        this.getUnreviewedTransactions();
      }
    } else {
      this.trxIndex++;
      this.reviewedTransctionList[this.trxIndex] == undefined
        ? this.getUnreviewedTransactions()
        : this.loadTransaction(this.reviewedTransctionList[this.trxIndex]);
    }
  }

  addTransactionToReviewedList(updateExisting:Boolean) {
    if (this.confirmAccept) {
      this.cTransaction.reviewAction = {
        accepted: true,
        tipsAccepted: this.trxTipsValue,
        reviewNotes: this.reviewNotes,
      };
    } else {
      this.cTransaction.reviewAction = {
        accepted: false,
        tipsAccepted: this.trxTipsValue,
        reviewNotes: this.reviewNotes,
        newAmount: this.newAmount,
        newMileage: this.newReadingMileage,
        rejectionReasonIds: this.rejectionReasonIds,
      };
    }
    if(!updateExisting){
      this.UnreviewedTransctionList.splice(
        this.UnreviewedTransctionList.findIndex(
          (trx) => trx.trxId == this.cTransaction.trxId
        ),
        1
      );
    }
   
    const existingIndex = this.reviewedTransctionList.findIndex(
      (tr) => tr.trxId === this.cTransaction.trxId
    );

    if (existingIndex !== -1) {
      this.reviewedTransctionList[existingIndex] = this.cTransaction;
    } else {
      this.reviewedTransctionList.push(this.cTransaction);
    }
  }

  loadTransaction(transaction: any) {
    if (transaction.reviewAction.accepted) {
      this.reviewNotes = transaction.reviewAction.reviewNotes;
      this.trxTipsValue = transaction.reviewAction.tipsAccepted;

      this.isTipsAllowed = transaction.tips.hasTips;

      this.confirmAccept = transaction.reviewAction.accepted;
      this.confirmRejectAndTips = false;
      this.rejectionReasonIds=[]
      this.cTransaction = transaction;
      this.newAmount = null;
      this.newReadingMileage = null;
      this.getMileageFileName(
        transaction.trxData.merchantId,
        transaction.trxData.siteId,
        transaction.trxId
      );
      this.getSalesPersonName(
        transaction.trxData.merchantId,
        transaction.trxData.salesPersonId
      );
    } else {
      this.reviewNotes = transaction.reviewAction.reviewNotes;
      this.trxTipsValue = transaction.reviewAction.tipsAccepted;
      this.isTipsAllowed = transaction.tips.hasTips;
      this.newAmount = transaction.reviewAction.newAmount;
      this.newReadingMileage = transaction.reviewAction.newMileage;
      this.rejectionReasonIds = transaction.reviewAction.rejectionReasonIds;
      this.confirmRejectAndTips = true;
      this.isChecked = true;
      this.confirmAccept = transaction.reviewAction.accepted;
      this.cTransaction = transaction;
      this.getMileageFileName(
        transaction.trxData.merchantId,
        transaction.trxData.siteId,
        transaction.trxId
      );
      this.getSalesPersonName(
        transaction.trxData.merchantId,
        transaction.trxData.salesPersonId
      );
    }
  }
  validateInput() {
    if (!this.confirmAccept && !this.confirmRejectAndTips) {
      this.translate
        .get(["transaction.selectReviewStatus", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    } else if (
      this.confirmRejectAndTips &&
      this.rejectionReasonIds.length == 0
    ) {
      this.translate
        .get(["transaction.infoRejectionReason", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    } else if (this.confirmRejectAndTips && !this.isChecked) {
      this.translate
        .get(["transaction.confirmRejection", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    } else {
      return true;
    }
    return false;
  }

  transactionVehicleDetail(id: number, data: Transaction, newMileage: number) {
    return {
      assetId:
        data?.transactionItems?.length > 1
          ? data?.transactionItems[data?.transactionItems?.length - 1]?.assetId
          : data?.transactionItems[0]?.assetId,
      transactionId: id,
      transactionVehicleDistance:
        data?.transactionItems?.length > 1
          ? data?.transactionItems[data?.transactionItems?.length - 1]
              ?.currentMileage
          : data?.transactionItems[0]?.currentMileage,
      updatedVehicleDistance: newMileage,
    };
  }

  RejectedTransaction(
    id: number,
    data: Transaction,
    newMileage: number,
    newAmount: number,
    reviewNotes: string,
    isTipsAllowed: boolean,
    trxTipsValue: boolean,
    rejectionReasonIds: []
  ):RejectedTransaction {
    let rejectedTransaction: RejectedTransaction = {};
    if (isTipsAllowed) {
      if (trxTipsValue) {
        rejectedTransaction.tipsAccepted = true;
      } else {
        rejectedTransaction.tipsAccepted = false;
      }
    }
    rejectedTransaction.transactionUuid = data?.uuid;
    rejectedTransaction.transactionId = id;
    rejectedTransaction.reviewStatus = ReviewStatus?.FAILED;
    rejectedTransaction.reviewNotes = reviewNotes;
    rejectedTransaction.currentTransactionAmount = data.amount;
    rejectedTransaction.updatedTransactionAmount = newAmount;
    rejectedTransaction.rejectedMileageReading =
      data?.transactionItems?.length > 1
        ? data?.transactionItems[data?.transactionItems?.length - 1]
            ?.currentMileage
        : data?.transactionItems[0]?.currentMileage;
    rejectedTransaction.updatedMileage = newMileage;
    rejectedTransaction.rejectionReasons = rejectionReasonIds.map(
      (rejectionReasonId) => {
        return {
          rejectionReasonId: rejectionReasonId,
          transactionId: id,
        };
      }
    );

    return rejectedTransaction;
  }
  confirmTransaction(
    id: number,
    data: Transaction,
    isTipsAllowed: boolean,
    trxTipsValue: boolean,
    reviewNotes: string
  ):AcceptedTransaction {
    let acceptedTransaction: AcceptedTransaction = {};
    acceptedTransaction.transactionUuid = data?.uuid;
    acceptedTransaction.transactionId = id;
    acceptedTransaction.reviewStatus = ReviewStatus?.PASSED;
    acceptedTransaction.reviewNotes = reviewNotes;
    if (isTipsAllowed) {
      if (trxTipsValue) {
        acceptedTransaction.tipsAccepted = true;
      } else {
        acceptedTransaction.tipsAccepted = false;
      }
    }
    return acceptedTransaction;
  }

  HandleData() {
    this.reviewedTransctionList.map((data) => {
      const existingIndex = this.transactionReviewLog.findIndex(
        (tr) => tr.transactionId === data.trxId
      );
      if (existingIndex != -1) {
        if (data.reviewAction.accepted) {
          this.transactionReviewLog[existingIndex] = this.confirmTransaction(
            data.trxId,
            data.trxData,
            data.tips.hasTips,
            data.reviewAction.tipsAccepted,
            data.reviewAction.reviewNotes
          );
        } else {
          this.transactionReviewLog[existingIndex] = this.RejectedTransaction(
            data.trxId,
            data.trxData,
            data.reviewAction.newMileage,
            data.reviewAction.newAmount,
            data.reviewAction.reviewNotes,
            data.tips.hasTips,
            data.reviewAction.tipsAccepted,
            data.reviewAction.rejectionReasonIds
          );
          const vehicleDindex = this.transactionsVehicleDistance.findIndex(
            (tr) => tr.transactionId === data.trxId
          );
          this.transactionsVehicleDistance[vehicleDindex] =
            this.transactionVehicleDetail(
              data.trxId,
              data.trxData,
              data.reviewAction.newMileage
            );
        }
      } else {
        if (data.reviewAction.accepted) {
          this.transactionReviewLog.push(
            this.confirmTransaction(
              data.trxId,
              data.trxData,
              data.tips.hasTips,
              data.reviewAction.tipsAccepted,
              data.reviewAction.reviewNotes
            )
          );
        } else {
          this.transactionReviewLog.push(
            this.RejectedTransaction(
              data.trxId,
              data.trxData,
              data.reviewAction.newMileage,
              data.reviewAction.newAmount,
              data.reviewAction.reviewNotes,
              data.tips.hasTips,
              data.reviewAction.tipsAccepted,
              data.reviewAction.rejectionReasonIds
            )
          );
          this.transactionsVehicleDistance.push(
            this.transactionVehicleDetail(
              data.trxId,
              data.trxData,
              data.reviewAction.newMileage
            )
          );
        }
      }
    });
  }

  submitReviewTransaction() {
    if (this.validateInput()) {
      this.addTransactionToReviewedList(true);
      this.HandleData();
      const accept = [];
      const reject = [];
      this.transactionReviewLog.map((tr) => {
        if (tr.tipsAccepted) {
          accept.push(tr.transactionId);
        } else {
          reject.push(tr.transactionId);
        }
      });
      this.newTipsOnTransactions.acceptedTipsTransactions = accept;
      this.newTipsOnTransactions.rejectedTipsTransactions = reject;

      forkJoin(
        [
          this.transactionsVehicleDistance.length
            ? this.transactionService.updateVehicleDistance(
                this.transactionsVehicleDistance
              )
            : null,
          this.transactionReviewLog.length
            ? this.transactionService.createTransactionReviews(
                this.transactionReviewLog
              )
            : null,
          this.newTipsOnTransactions.acceptedTipsTransactions.length ||
          this.newTipsOnTransactions.rejectedTipsTransactions.length
            ? this.transactionService.updateTransactionsTips(
                this.newTipsOnTransactions
              )
            : null,
        ].filter(Boolean)
      ).subscribe(
        () => {
          this.handleSuccessResponse();
          this.translate.get("reviewedSuccessfully").subscribe((res) => {
            this.toastr.success(res);
          });
        },
        (err) => {
          this.modalService.dismissAll();
          this.errorService.handleErrorResponse(err);
        }
      );
    }
  }

  handleSuccessResponse() {
    this.modalService.dismissAll();
    this.router.navigate(["/admin/transactions"]);
  }

  acceptTransaction() {
    this.confirmAccept = true;
    this.confirmRejectAndTips = false;
    this.newAmount = null;
    this.newReadingMileage = null;
  }

  denyTransaction() {
    this.confirmAccept = false;
    this.confirmRejectAndTips = true;
  }

  selectAll(values: string[]) {
    if (values.includes("selectAll")) {
      this.rejectionReasonIds = this.rejectReasons.map((reason) => reason.id);
    }
  }

  openModal(goBack: boolean) {
    this.confirmModalComponent.open();
    this.isGoBack = goBack;
  }

  cancelReview() {
    this.router.navigate(["/admin/transactions"]);
    this.modalService.dismissAll();
  }

  onKey(tag, event) {
    let defaultRejectReasons: number;
    this.confirmRejectAndTips = true;
    this.confirmAccept = false;

    if (event.target?.value) {
      if (tag == "AMOUNT") {
        defaultRejectReasons = this.rejectReasons.find(
          (rejectReason) => rejectReason.tag == "AMOUNT"
        )?.id;
      }
      if (tag == "MILEAGE") {
        defaultRejectReasons = this.rejectReasons.find(
          (rejectReason) => rejectReason.tag == "MILEAGE"
        )?.id;
      }

      if (this.rejectionReasonIds?.includes(defaultRejectReasons) == true) {
        this.rejectionReasonIds = [...this.rejectionReasonIds];
      } else {
        this.rejectionReasonIds = [
          ...this.rejectionReasonIds,
          defaultRejectReasons,
        ];
      }
    } else {
      if (tag == "AMOUNT") {
        const id = this.rejectReasons.find(
          (rejectReason) => rejectReason.tag == "AMOUNT"
        )?.id;
        this.rejectionReasonIds.findIndex((index) => index == id);
        this.rejectionReasonIds.splice(
          this.rejectionReasonIds.findIndex((index) => index == id),
          1
        );
        this.rejectionReasonIds = [...this.rejectionReasonIds];
      } else {
        const id = this.rejectReasons.find(
          (rejectReason) => rejectReason.tag == "MILEAGE"
        )?.id;
        this.rejectionReasonIds.findIndex((index) => index == id);
        this.rejectionReasonIds.splice(
          this.rejectionReasonIds.findIndex((index) => index == id),
          1
        );
        this.rejectionReasonIds = [...this.rejectionReasonIds];
      }
    }
  }

  displayFullImg() {
    this.showImg = true;
  }

  closeFullImg() {
    this.showImg = false;
  }

  previousTransaction() {
    if (this.reviewedTransctionList.length > 0) {
      if (this.validateInput()) {
        this.addTransactionToReviewedList(true);
        this.trxIndex == 0 ? 0 : this.trxIndex--;
        this.loadTransaction(this.reviewedTransctionList[this.trxIndex]);
      }
    }
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
