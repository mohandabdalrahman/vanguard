import { ViewerService } from './../../../shared/services/viewer.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getRelatedSystemId } from '@helpers/related-systemid';
import { viewer } from '@models/Viewer.model';
import { ColData } from '@models/column-data.model';
import { BaseResponse } from '@models/response.model';
import { TransactionReview } from '@models/transaction.model';
// import { Transaction } from '@models/transaction.model';
import { User } from '@models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { CurrentLangService } from '@shared/services/current-lang.service';
import { QueryParamsService } from '@shared/services/query-params.service';
import { TransactionService } from '@shared/services/transaction.service';
import { MerchantSite } from '@shared/sites/site.model';
import { SiteService } from '@shared/sites/site.service';
import { CorporateUserService } from 'app/admin/corporate-user/corporate-user.service';
import { Corporate } from 'app/admin/corporates/corporate.model';
import { CorporateService } from 'app/admin/corporates/corporate.service';
import { Merchant } from 'app/admin/merchants/merchant.model';
import { MerchantService } from 'app/admin/merchants/merchant.service';

import { forkJoin } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-corporate-transaction-reports',
  templateUrl: './corporate-transaction-reports.component.html',
  styleUrls: ['./corporate-transaction-reports.component.scss']
})
export class CorporateTransactionReportsComponent implements OnInit, OnDestroy {
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  sitesTransaction: MerchantSite[] = [];
  corporateUsersTransaction: User[] = [];
  corporatesTransaction: Corporate[] = [];
  merchantsTransaction: Merchant[] = [];
  ViewerTransaction: viewer[] = [];
  transactions: any[] = [];
  totalElements: number;
  currentPage: number = 1;
  pageSize: number = 10;
  sortDirection: string;
  sortBy: string;
  corporateId:number;

  private subs = new SubSink();

  constructor(private route:ActivatedRoute,private transactionService: TransactionService,  private siteService: SiteService, private corporateUserService: CorporateUserService, private queryParamsService: QueryParamsService,
    private corporateService: CorporateService, private merchantService: MerchantService, private currentLangService: CurrentLangService, private translate: TranslateService,private ViewerService:ViewerService) { }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData()
    this.route.parent.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");

    }),
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.transactions);
      }),
    );

    this.getTransactions()


  }


  getTransactions() {
    this.transactionService.getCorporateTransactionReport(this.corporateId,this.currentPage - 1,
      this.pageSize,
      this.sortDirection,
      this.sortBy).subscribe((Transaction: BaseResponse<TransactionReview>) => {
        this.transactions = Transaction.content
        this.totalElements = Transaction.totalElements
        this.getTransactionData(Transaction.content)
      })
  }

  getTransactionData(transactions: TransactionReview[]) {
    if (transactions.length > 0) {
      
      this.subs.add(
        forkJoin([
          this.siteService.getSiteList({
            ids: [...new Set(transactions.map((t) => t.transactionSiteId))],
          }),
          this.corporateUserService.getCorporatesUsers({
            userIds: [...new Set(transactions.map((t) => t.transactionCardHolderId))],
          }),
          this.corporateService.getCorporates({
            ids: [...new Set(transactions.map((t) => t.transactionCorporateId))],
          }),
          this.merchantService.getMerchants({
            ids: [...new Set(transactions.map((t) => t.transactionMerchantId))],
          }),
          this.ViewerService.GetCorporateReViewerName({
            userIds: [...new Set(transactions.map((t) => t.reviewerId))],
          })
        ]).subscribe(([sitesTransaction, corporateUsersTransaction, corporatesTransaction, merchantsTransaction,ViewerTransaction]) => {
          
          this.sitesTransaction = sitesTransaction.content;
          this.corporateUsersTransaction = corporateUsersTransaction.content;
          this.corporatesTransaction = corporatesTransaction.content;
          this.merchantsTransaction = merchantsTransaction.content;
          this.ViewerTransaction=ViewerTransaction.content
          this.setGridData(transactions);
        })
      )
    } else {
      this.gridData = [];
    }
  }
  
  setColData() {
    this.colData = [
      { field: "status", header: "transaction.status" },
      //{ field: "id", header: "transaction.rootOuId" },
      { field: "transactionCreationDate", header: "transaction.Transactiontimeanddate" },
      { field: "reviewer", header: "transaction.Auditedby" },
      { field: "creationDate", header: "transaction.Audittimeanddate" },
      { field: "Originalamount", header: "transaction.Originalamount" },
      //{ field: "Adjustedamount", header: "transaction.Adjustedamount" },
      //{ field: "Thedifferenceinamount", header: "transaction.Thedifferenceinamount" },
      { field: "Originalmeterreading", header: "transaction.Originalmeterreading(km)" },
      //{ field: "Adjustedmeterreading", header: "transaction.Adjustedmeterreading(km)" },
      //{ field: "Thedifferenceinmeterreading", header: "transaction.Thedifferenceinmeterreading(km)" },
      //{ field: "corporateName", header: "transaction.corporateName" },
      {field: "reviewNotes", header: "transaction.transactionNotes"},
      { field: "cardHolderName", header: "transaction.cardHolderName" },
      { field: "merchantName", header: "transaction.merchantName" },
      { field: "siteName", header: "transaction.siteName" },
    ];
  }

  setGridData(transactions: any) {
    if (transactions.length) {
      this.gridData = transactions.map((transaction) => {
        let Thedifferenceinamount: number = transaction.currentTransactionAmount - transaction.updatedTransactionAmount
        let Thedifferenceinmeterreading: number = transaction.rejectedMileageReading - transaction.updatedMileage
        Number.isNaN(Thedifferenceinamount) ? Thedifferenceinamount = null : Thedifferenceinamount
        Number.isNaN(Thedifferenceinmeterreading) ? Thedifferenceinmeterreading = null : Thedifferenceinmeterreading

        return {
          //id: transaction.id,
          uuid: transaction.uuid,
          creationDate: this.DateAndTimeFormat(transaction.creationDate),
          status: transaction.reviewStatus,
          transactionCreationDate: this.DateAndTimeFormat(transaction.transactionCreationDate),
          reviewer: this.currentLang === "en" ?
          this.ViewerTransaction.find((s) => s.id == transaction.reviewerId)?.enName :
          this.ViewerTransaction.find((s) => s.id == transaction.reviewerId)?.localeName,

          merchantName: this.currentLang === "en" ?
            this.merchantsTransaction.find((s) => s.id == transaction.transactionMerchantId)?.enName :
            this.merchantsTransaction.find((s) => s.id == transaction.transactionMerchantId)?.localeName,
          siteName: this.currentLang === "en" ?
            this.sitesTransaction.find((s) => s.id == transaction.transactionSiteId)?.enName :
            this.sitesTransaction.find((s) => s.id == transaction.transactionSiteId)?.localeName,
          cardHolderName: this.currentLang === "en" ?
            this.corporateUsersTransaction.find((s) => s.id == transaction.transactionCardHolderId)?.enName :
            this.corporateUsersTransaction.find((s) => s.id == transaction.transactionCardHolderId)?.localeName,
          // corporateName: this.currentLang === "en" ?
          //   this.corporatesTransaction.find((s) => s.id == transaction.transactionCorporateId)?.enName :
          //   this.corporatesTransaction.find((s) => s.id == transaction.transactionCorporateId)?.localeName,
          reviewNotes: transaction.reviewNotes,
          Originalamount: transaction.currentTransactionAmount,
          Adjustedamount: transaction.updatedTransactionAmount,
          Thedifferenceinamount: Thedifferenceinamount,
          Originalmeterreading: transaction.rejectedMileageReading,
          Adjustedmeterreading: transaction.updatedMileage,
          Thedifferenceinmeterreading: Thedifferenceinmeterreading,


        };
      });

    } else {
      this.gridData = [];
    }
  }

  DateAndTimeFormat(transaction: any) {
    const inputDate = new Date(transaction)
    const year = inputDate.getFullYear().toString();
    const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
    const day = inputDate.getDate().toString().padStart(2, '0');
    const hours = inputDate.getHours().toString().padStart(2, '0');
    const minutes = inputDate.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${hours}:${minutes} / ${day}-${month}-${year} `;
    return formattedDate
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

    this.getTransactions();

  }
  ngOnDestroy() {
    this.subs.unsubscribe();

  }
}
