import {Component, OnInit} from '@angular/core';
import {ColData} from "@models/column-data.model";
import {SubSink} from "subsink";
import {ActivatedRoute} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ReportService} from "@shared/services/report.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";
import {addMonths, fixTimeZone} from "@helpers/timezone.module";
import {ErrorService} from "@shared/services/error.service";
import {removeNullProps} from "@helpers/check-obj";
import {CorporateBankStatement} from "@models/reports.model";
import {ToastrService} from "ngx-toastr";
import {PdfService} from "@shared/services/pdf.service";
import {ExcelService} from "@shared/services/excel.service";
import {Corporate} from "../../corporates/corporate.model";
import {CorporateService} from "../../corporates/corporate.service";

@Component({
  selector: 'app-bank-statement',
  templateUrl: './bank-statement.component.html',
  styleUrls: ['./bank-statement.component.scss']
})
export class BankStatementComponent implements OnInit {
  private subs = new SubSink();
  gridData: CorporateBankStatement[] = [];
  colData: ColData[] = [];
  currentLang: string;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  corporateId: number;
  fromDate: string;
  toDate: string;
  bankStatements: CorporateBankStatement[ ] = [];
  isRtl: boolean;
  corporate: Corporate;

  constructor(private route: ActivatedRoute,
              private reportService: ReportService,
              private currentLangService: CurrentLangService,
              private translate: TranslateService,
              private errorService: ErrorService,
              private toastrService: ToastrService,
              private pdfService: PdfService,
              private excelService: ExcelService,
              private corporateService: CorporateService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      }),
    )
    this.getCorporate();
    this.setColData();
    this.getCorporateBankStatement(this.pageSize)
  }

    setColData() {
    this.colData = [
      {
        field: 'transactionCreationDate',
        header: 'transaction.creationDate'
      },
      {
        field: 'trxDescription',
        header: 'transaction.description'
      },
      {
        field: 'transactionAmountCredit',
        header: 'transaction.credit'
      },
      {
        field: 'transactionAmountDebit',
        header: 'transaction.debit'
      },
      {
        field: 'corporateBalance',
        header: 'corporates.balance'
      }
    ]
  }

  setGridData(data: CorporateBankStatement[]) {
    if (data.length) {
      this.gridData = data.map(item => {
        return {
          id: item.id,
          corporateId: item.corporateId,
          trxDescription: item.trxDescription,
          transactionCreationDate: new Date(
            item.transactionCreationDate
          ).toLocaleDateString() + " " + new Date(
            item.transactionCreationDate
          ).toLocaleTimeString(),
          transactionType: item.transactionType,
          ...(item.transactionType === 'DEBIT' && {transactionAmountDebit: item.transactionAmount}),
          ...(item.transactionType === 'CREDIT' && {transactionAmountCredit: item.transactionAmount}),
          corporateBalance: item.corporateBalance
        }
      })
    } else {
      this.gridData = []
    }
  }

  getCorporateBankStatement(pageSize?: number, exportType?: string) {
    this.pageSize = pageSize;
    this.subs.add(
      this.reportService.getCorporateBankStatement(removeNullProps({
        corporateId: this.corporateId,
        fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
        toDate: this.toDate ? fixTimeZone(addMonths(Date.parse(this.toDate), 1)) : null
      }), this.currentPage - 1, this.pageSize).subscribe((res) => {
        if (pageSize) {
          if (res.content?.length) {
            this.bankStatements = res.content;
            this.totalElements = res.totalElements;
            this.setGridData(this.bankStatements)
          } else {
            this.bankStatements = null;
            this.totalElements = 0;
            this.setGridData(null);
            this.translate
              .get(["error.noBankStatements", "type.warning"])
              .subscribe((res) => {
                this.toastrService.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
        } else {
          if (exportType == "excel") {
            if (this.currentLang === "ar") {
              this.isRtl = true;
            }
            this.setGridData(this.bankStatements);
            setTimeout(() => {
              this.excelService.exportAsExcelFile(
                document.getElementById("printable-sale"),
                "CorporateBankStatement",
                this.isRtl
              );
              this.setGridData(this.bankStatements);
            }, 1000);
          } else if (exportType == "pdf") {
            this.setGridData(this.bankStatements);
            setTimeout(() => {
              this.pdfService.printReport(this.colData, this.gridData, 'Bank Statement', this.currentLang)
              this.setGridData(this.bankStatements);
            }, 1000);
          }
        }
      }, err => {
        this.errorService.handleErrorResponse(err);
      })
    )
  }

  getCorporate(): void {
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.corporate = corporate;
          }
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getCorporateBankStatement(10);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getCorporateBankStatement(this.pageSize);
  }

  exportFile(exportType: 'pdf' | 'excel') {
    this.getCorporateBankStatement(null, exportType);
  }
}
