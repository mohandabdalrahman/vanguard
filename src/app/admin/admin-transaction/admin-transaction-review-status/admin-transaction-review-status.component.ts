import { ViewerService } from '../../../shared/services/viewer.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { viewer } from '@models/Viewer.model';
import { CellData } from '@models/cell-data.model';
import { ColData } from '@models/column-data.model';
import { BaseResponse } from '@models/response.model';
import { Transaction } from '@models/transaction.model';
//import { TransactionSearch } from '@models/transaction.model';
// import { Transaction } from '@models/transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { CurrentLangService } from '@shared/services/current-lang.service';
import { EmitService } from '@shared/services/emit.service';
import { ErrorService } from '@shared/services/error.service';
import { QueryParamsService } from '@shared/services/query-params.service';
import { TransactionService } from '@shared/services/transaction.service';
import { DeleteModalComponent } from '@theme/components';
import { ModalComponent } from '@theme/components/modal/modal.component';
import { ToastrService } from 'ngx-toastr';

import { forkJoin } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-admin-transaction-review-status',
  templateUrl: './admin-transaction-review-status.component.html',
  styleUrls: ['./admin-transaction-review-status.component.scss']
})
export class AdminTransactionReviewStatusComponent implements OnInit, OnDestroy {
  @ViewChild("transactionUuidsModal") private transactionUuidsModal: ModalComponent;
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];

  unprocessedGridData: any[] = [];
  unprocessedColData: ColData[] = [];
  
  reviewer: viewer[] = [];
  transactions: any[] = [];
  totalElements: number;
  currentPage: number = 1;
  pageSize: number = 10;
  sortDirection: string;
  sortBy: string;
  inReviewTransactions =new Map<string, number[]>();
  totalUnprocessedTransaction: number = 0 ;
  unprocessedTransactionIds: number [] = [];
  lastTrxId: number = 0;

  private subs = new SubSink();
  selectedUserTransactions: string [];
  selectedReviewerId: number;

  constructor(private transactionService: TransactionService,  private queryParamsService: QueryParamsService,
     private currentLangService: CurrentLangService, private translate: TranslateService,private ViewerService:ViewerService,
     private emitService: EmitService,private toastr: ToastrService,
     private errorService: ErrorService,) { }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.setUnProcessedColData();

    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        //this.setGridData(this.inReviewTransactions);
        this.setUnProcessedColData();
        //this.setUnProcessedGridData(this.unprocessedTransactionIds);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.selectedReviewerId = id;
        this.deleteModalComponent.open();
      })
    );

    this.getCurrentlyInReviewTransactions();
    this.getUnProcessedTransactions();  
    this.getLastTransactionId();

  }
  getLastTransactionId() {
    this.transactionService.getCurrentlyInReviewTransactions("*LAST_RESERVED_ID*").subscribe((lastTrxId: Map<string,number[]>) => {
     
      if(Object.keys(lastTrxId)?.length ){
        this.lastTrxId = lastTrxId["LAST_RESERVED_ID"]
      }
    })
  }
  
  getCurrentlyInReviewTransactions() {
    this.transactionService.getCurrentlyInReviewTransactions("*CURRENTLY_REVIEW_TRANSACTIONS*").subscribe((inReviewTransactions: Map<string,number[]>) => {
      this.getTransactionData(inReviewTransactions)
    })
  }


  getUnProcessedTransactions() {
    this.transactionService.getCurrentlyInReviewTransactions("*NON_PROCESSED_RESERVED_TRANSACTION_IDS*").subscribe((unprocessedTransactions: Map<string,number[]>) => {
        if(Object.keys(unprocessedTransactions)?.length ){
          this.totalUnprocessedTransaction = unprocessedTransactions["NON_PROCESSED_RESERVED_TRANSACTION_IDS"].length
          this.unprocessedTransactionIds = unprocessedTransactions["NON_PROCESSED_RESERVED_TRANSACTION_IDS"]
          if(this.unprocessedTransactionIds?.length > 0){
            this.setUnProcessedGridData(this.unprocessedTransactionIds);
          } else {
            this.unprocessedGridData = [];
          }
        }
      })
  }

  getTransactionData(inReviewTransactions: Map<string,number[]>) {
    this.inReviewTransactions = inReviewTransactions;
    console.log(inReviewTransactions)
    if (Object.keys(inReviewTransactions).length > 0) {
      let reviewerIds : number[]=[]; 
      let transactionIds: number[]=[];
      Object.keys(inReviewTransactions).forEach((key: string) => {
        transactionIds.push(...inReviewTransactions[key]);
        reviewerIds.push(Number(key.split(":")[1]))
      });

      this.totalElements = transactionIds.length;
      
      
      let transactionSearchObj = {'transactionIds': transactionIds};

      this.subs.add(
        forkJoin([
          this.transactionService.getTransactions(null,null,transactionSearchObj,null,null,null,null),
          this.ViewerService.GetViewerName({
            userIds: reviewerIds,
          })
        ]).subscribe(([transactions, reviewerTransaction]) => {
          this.transactions = transactions.content;
          this.reviewer=reviewerTransaction.content
          this.setGridData(inReviewTransactions);
        })
      )
    } else {
      this.gridData = [];
    }
  }
  
  setColData() {
    this.colData = [
      { field: "reviewer", header: "app.username" },
      //{ field: "uuid", header: "transaction.uuid" },
      { field: "count", header: "transaction.count" , clickable: true},
    ];
  }

  setGridData(inReviewTransactions: Map<string,number[]>) {

    if (Object.keys(inReviewTransactions).length) {
      
      Object.keys(inReviewTransactions).forEach((key: string) => {
        this.gridData.push(
         {
          id:Number(key.split(":")[1]),
          key: key,
          reviewer: this.reviewer.find((r) => Number(key.split(":")[1]) == r.id)?.username,
          
          count: inReviewTransactions[key].length
        })
    });
  } else {
      this.gridData = [];
    }
  }


  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = +pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {

    this.getCurrentlyInReviewTransactions();

  }
  ngOnDestroy() {
    this.subs.unsubscribe();

  }

  handleCellClick(cellData: CellData) {
    console.log(cellData);
    if (cellData.field === 'count') {
      this.selectedUserTransactions = this.inReviewTransactions[cellData?.data?.key].map((v) => this.transactions.find((t) => t.id == v)?.uuid),
      console.log(this.selectedUserTransactions);
      this.transactionUuidsModal.open()
    } 
  }

  releaseTransactions() {
    
    this.subs.add(
      this.transactionService.releaseReviewTransactionsForUser(this.selectedReviewerId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  setUnProcessedGridData(unprocessedTransactionIds: number[]) {
    let transactionSearchObj = {'transactionIds': unprocessedTransactionIds};
    this.transactionService.getTransactions(null,null,transactionSearchObj,null,null,null,null).subscribe((transactions: BaseResponse<Transaction>) => {
      if(transactions?.content?.length){
        console.log("Setting unprocessed grid data");
        console.log(transactions.content);
        transactions.content.forEach((t : Transaction) =>{this.unprocessedGridData.push({uuid:  t.uuid});} )
        
      }else{
        this.unprocessedGridData = [];
      }
    })
    
  }
  setUnProcessedColData() {
    console.log("Setting unproceessed col data")
    this.unprocessedColData = [
      //{ field: "reviewer", header: "transaction.Auditedby" },
      { field: "uuid", header: "transaction.uuid" },
      //{ field: "count", header: "transaction.count" , clickable: true},
    ];
  }
}
