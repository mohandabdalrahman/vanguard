import { LoaderService } from '@shared/services/loader.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseResponse } from '@models/response.model';
import {
  ReviewStatus,
  Transaction,
  //TransactionReview,
  CorporateReviewLog,
  ExtendedCorporateReviewLog
} from '@models/transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { CurrentLangService } from '@shared/services/current-lang.service';
import { ErrorService } from '@shared/services/error.service';
import { MileageService } from '@shared/services/mileage.service';
import { TransactionService } from '@shared/services/transaction.service';
import { MerchantSite } from '@shared/sites/site.model';
import { SiteService } from '@shared/sites/site.service';
import { ModalComponent } from '@theme/components/modal/modal.component';
import { Merchant } from 'app/admin/merchants/merchant.model';
import { MerchantService } from 'app/admin/merchants/merchant.service';

import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { SubSink } from 'subsink';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { getRelatedSystemId } from '@helpers/related-systemid';

@Component({
  selector: 'app-admin-transaction-review',
  templateUrl: './corporate-transaction-review-details.component.html',
  styleUrls: ['./corporate-transaction-review-details.component.scss']
})

export class CorporateTransactionReviewComponent implements OnInit {
  private subs = new SubSink();
  @ViewChild("confirmReview") confirmModalComponent: ModalComponent;
  corporateId: number;
  currentLang: string;
  merchantsTransaction: Merchant[] = [];
  merchant: Merchant;
  sitesTransaction: MerchantSite[] = [];
  site: MerchantSite;
  unreviewedTransaction: Transaction[] = [];
  currentTransaction: Transaction;
  transactionReviewLog: any[] = [];
  mileageFileFound: boolean;
  mileageFile;
  transactionMerchantName: string;
  transactionSiteName: string;
  confirmRejectAndTips: boolean = false;
  confirmAccept: boolean = false;
  reviewNotes: string;
  trasactionToBeDisplayed: number = 0;
  isGoBack: boolean = true;
  showImg: boolean = false;
  ouId : number;
  //amount:number;
  //milage:number;
  nextTransactionWork: boolean = false;
  Alltransaction:any[]=[]
  TransactionSteps: number = 0;

  reviewedTransaction:Map<number,ExtendedCorporateReviewLog> = new Map();
  currentlyReviewingTransaction: ExtendedCorporateReviewLog =new ExtendedCorporateReviewLog();
  currentIndex: number = 0;
  corporateReviewLog: CorporateReviewLog;
  pageNumber: number = 0;

  constructor(
    private LoaderService:LoaderService,
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private siteService: SiteService,
    private mileageService: MileageService,
    private transactionService: TransactionService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;  
        this.getTransactionData(this.currentTransaction, this.currentLang)
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      );
    this.ouId = this.transactionService.ouId;
    this.getCorporateUnreviewedTransactions(this.corporateId);
  }

  getCorporateUnreviewedTransactions(corporateId: number) {
    
    this.subs.add(
      this.transactionService.
        getCorporateUnreviewedTransactions(
          corporateId,
          this.pageNumber,
          10,
          //this.ouId 
        )
        .subscribe(
          (transactions: BaseResponse<Transaction>) => {

            if (transactions.content?.length > 0) {
              this.unreviewedTransaction.push(...transactions.content) ;  
              
              this.getTransactionDetailsData(this.unreviewedTransaction);
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
        ids: [...new Set(transactions.map((t) => t.siteId))],
      }),
      this.merchantService.getMerchants({
        ids: [...new Set(transactions.map((t) => t.merchantId))],
      }),

    ]).subscribe(([sitesTransaction, merchantsTransaction]) => {
      
      this.sitesTransaction = sitesTransaction.content;
      this.merchantsTransaction = merchantsTransaction.content;
      this.getResetOfTransactionData(transactions[this.currentIndex]);
    })
  }

  getResetOfTransactionData(transaction: Transaction) {
    
    if(transaction!=undefined){
      this.currentlyReviewingTransaction = new ExtendedCorporateReviewLog();
      if(this.reviewedTransaction.get(transaction.id) == null){
        this.currentlyReviewingTransaction.transactionId = transaction.id;
        this.currentlyReviewingTransaction.transactionUuid = transaction.uuid;
        this.currentlyReviewingTransaction.reviewStatus = null;
        this.currentlyReviewingTransaction.reviewNotes = null;
  
        this.currentlyReviewingTransaction.milage = transaction.transactionItems[0].currentMileage;
        this.currentlyReviewingTransaction.amount = transaction.transactionItems[0].amount;
        // html binding attributes
        this.reviewNotes = null;
        this.confirmAccept = null;
        this.confirmRejectAndTips=null;
  
      }else{ // transaction has been reviewed before

        this.currentlyReviewingTransaction = this.reviewedTransaction.get(transaction.id);
        // html binding attributes
        this.reviewNotes = this.currentlyReviewingTransaction.reviewNotes;
        this.confirmAccept = this.currentlyReviewingTransaction.reviewStatus == ReviewStatus.PASSED ? true : false;
        this.confirmRejectAndTips = this.currentlyReviewingTransaction.reviewStatus == ReviewStatus.FAILED ? true : false;
      }
      
      
      this.currentTransaction = transaction;
      
      this.showImg = false;
      this.getTransactionData(this.currentTransaction, this.currentLang)
      this.getMileageFileName(this.currentTransaction?.merchantId, this.currentTransaction?.siteId, this.currentTransaction?.id);
    }
  }

  getTransactionData(transaction: Transaction, lang) {
    this.LoaderService.setLoading(true);
    this.transactionMerchantName = lang == 'en' ?
      this.merchantsTransaction.find((m) => m.id == transaction?.merchantId)?.enName
      : this.merchantsTransaction.find((m) => m.id == transaction?.merchantId)?.localeName;
    this.transactionSiteName = lang == 'en' ?
      this.sitesTransaction.find((s) => s.id == transaction?.siteId)?.enName
      : this.sitesTransaction.find((s) => s.id == transaction?.siteId)?.localeName;
      this.LoaderService.setLoading(false);
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

  previousTransaction(){
    if(this.currentIndex - 1 < 0){
      return;
    }
    this.currentIndex--;
    if(this.validReview()){
      let key = this.currentlyReviewingTransaction.transactionId;
      let value = this.currentlyReviewingTransaction;
      if(this.reviewNotes !== null){
        this.reviewedTransaction.get(key).reviewNotes=this.reviewNotes;
      }
      this.reviewedTransaction.set(key, value);
      
    }
    this.getResetOfTransactionData(this.unreviewedTransaction[this.currentIndex]);
  }
  nextTransaction() {

    if(!this.validReview()){
      return;
    }
    let key = this.currentlyReviewingTransaction.transactionId;
    let value = this.currentlyReviewingTransaction;
    this.reviewedTransaction.set(key, value);
    if(this.reviewNotes !== null){
      this.reviewedTransaction.get(key).reviewNotes=this.reviewNotes;
    }
    this.nextTransactionWork = true

    this.trasactionToBeDisplayed++;
    this.currentIndex++;
    if (this.trasactionToBeDisplayed == this.unreviewedTransaction.length) {
      this.pageNumber++;
      this.getCorporateUnreviewedTransactions(this.corporateId)
      //this.trasactionToBeDisplayed = 0
      return;
    }
    this.getResetOfTransactionData(this.unreviewedTransaction[this.currentIndex]);

  }





  reviewTransaction() {
    if(this.validReview()){
      let key = this.currentlyReviewingTransaction.transactionId;
      let value = this.currentlyReviewingTransaction;
      this.reviewedTransaction.set(key, value);

    }
    if(this.getLength() == 0 ){
      this.translate
      .get(["transaction.selectReviewStatus", "type.warning"])
      .subscribe((res) => {
        this.toastr.warning(
          Object.values(res)[0] as string,
          Object.values(res)[1] as string
        );
      });
      return;
    }
    
    let corporateReviewTransactionLogs = Array.from(this.reviewedTransaction.values());
    
    
      corporateReviewTransactionLogs.length ? this.transactionService.createCorporateTransactionReviews(this.corporateId, corporateReviewTransactionLogs)
      .subscribe(
      () => {
        this.translate.get("reviewedSuccessfully").subscribe((res)=>{
          this.toastr.success(res);
        })
        
        this.modalService.dismissAll();
        this.router.navigate(["/corporate/transactions"]);
      },
      (err) => {
        
        this.modalService.dismissAll();
        this.errorService.handleErrorResponse(err);
      }
    ):null;
  }

  acceptTransaction() {
    this.currentlyReviewingTransaction.reviewStatus = ReviewStatus.PASSED;
    this.currentlyReviewingTransaction.reviewNotes = null;
    this.confirmAccept = true;
    this.confirmRejectAndTips = false;
  }

  denyTransaction() {
    this.currentlyReviewingTransaction.reviewStatus = ReviewStatus.FAILED;
    this.currentlyReviewingTransaction.reviewNotes = this.reviewNotes;
    this.confirmAccept = false;
    this.confirmRejectAndTips = true;
  }

  openModal(goBack: boolean) {
    this.confirmModalComponent.open()
    this.isGoBack = goBack;
  }

  cancelReview() {
    this.router.navigate(["/corporate/transactions"]);
    this.modalService.dismissAll();
  }

  displayFullImg(){
    this.showImg = true;
  }

  closeFullImg(){
    this.showImg = false
  }

  getLength(){
    if(this.reviewedTransaction == null){
      return 0;
    }
    return this.reviewedTransaction.size;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  validReview(): boolean {
    if (this.currentlyReviewingTransaction?.reviewStatus == null) {
      this.translate
        .get(["transaction.selectReviewStatus", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
        return false;
    }
    return true;
  }
}


