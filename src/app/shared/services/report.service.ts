import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {MerchantDashboard} from "@models/merchant-dashboard.model";
import {Observable, Subject} from "rxjs";
import {catchError} from "rxjs/operators";
import {
  AdminSearchObj,
  CorporateCommission,
  CorporateDetailedSales,
  Lookup,
  LookupType,
  MerchantSale,
  ManagementSearchObj,
  ProductCategoryDetailedSales,
  ProductCategoryPolicyBudget,
  SaleSearchObj,
  SalesGroup,
  TotalSales,
  TransactionsReportDto,
  TransactionsReportsSearchObj,
  VehicleReport,
  ManagementReportDto, CorporateBankStatement
} from "@models/reports.model";
import {CorporateDashboard} from "@models/corporate-dashboard.model";
import {BaseResponse} from "@models/response.model";


@Injectable({
  providedIn: "root",
})
export class ReportService {
  private dateSubject = new Subject<any>();
  private ouIdsSubject = new Subject<any>();
  date: { toDate: string; fromDate: string };
  ouIds: number[] = [];
  apiUrl: string;
  reportUrl: string;
  totalSalesUrl: string;
  lookupUrl: string;
  transactionsUrl: string;
  transactionItemsUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/reporting-service`;
    this.reportUrl = `${environment.baseUrl}/reporting-service/sales`;
    this.totalSalesUrl = `${environment.baseUrl}/reporting-service/sales/totals`;
    this.lookupUrl = `${environment.baseUrl}/reporting-service/lookup`;
    this.transactionsUrl = `${environment.baseUrl}/reporting-service/sales/transaction`;
    this.transactionItemsUrl = `${environment.baseUrl}/reporting-service/sales/transaction-item`;
  }


  getMerchantDashboard(merchantId: number): Observable<MerchantDashboard> {
    return this.http
      .get<MerchantDashboard>(`${this.apiUrl}/merchant/${merchantId}/dashboard`)
      .pipe(catchError(handleError));
  }


  getCorporateDashboard(corporateId: number): Observable<CorporateDashboard> {
    return this.http
      .get<CorporateDashboard>(`${this.apiUrl}/corporate/${corporateId}/dashboard`)
      .pipe(catchError(handleError));
  }

  getSales(
    searchObj: SaleSearchObj,
    pageNo?: number,
    pageSize?: number
  ): Observable<MerchantSale> {
    return this.http
      .get<MerchantSale>(`${this.reportUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  getTransactionsReport(
    searchObj: TransactionsReportsSearchObj,
    pageNo?: number,
    pageSize?: number
  ): Observable<TransactionsReportDto> {
    return this.http
      .get<TransactionsReportDto>(`${this.transactionsUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  getTransactionsItemsReport(
    searchObj: TransactionsReportsSearchObj,
    pageNo?: number,
    pageSize?: number
  ): Observable<TransactionsReportDto> {
    return this.http
      .get<TransactionsReportDto>(`${this.transactionItemsUrl}`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  getTotalSales(
    groupBy: SalesGroup,
    searchObj: SaleSearchObj,
    pageNo?: number,
    pageSize?: number
  ): Observable<TotalSales> {
    return this.http
      .get<TotalSales>(`${this.totalSalesUrl}`, {
        params: {
          ...searchObj,
          ...(groupBy && {groupBy}),
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        },
      })
      .pipe(catchError(handleError));
  }

  getMerchantCorporates(merchantId: number): Observable<Lookup[]> {
    return this.http
      .get<Lookup[]>(`${this.lookupUrl}/merchant/${merchantId}/corporates`)
      .pipe(catchError(handleError));
  }

  getCorporateLookup(corporateId: number, lookupType: LookupType): Observable<Lookup[]> {
    return this.http
      .get<Lookup[]>(`${this.lookupUrl}/corporate/${corporateId}`, {
        params: {
          lookupType,
        },
      })
      .pipe(catchError(handleError));
  }

  getManagementReport(
    searchObj: ManagementSearchObj,
    pageNo?: number,
    pageSize?: number
  ): Observable<ManagementReportDto> {
    return this.http
      .get<ManagementReportDto>(`${this.reportUrl}/management/report`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        }
      })
      .pipe(catchError(handleError));
  }

  getProductCategoryBudgetByPolicy(productCategoryId: number, corporateIds: number[]): Observable<ProductCategoryPolicyBudget[]> {
    return this.http
      .get<ProductCategoryPolicyBudget[]>(`${this.apiUrl}/product-category/${productCategoryId}/policy/budget`, {
        params: {
          corporateIds
        }
      })
      .pipe(catchError(handleError));
  }

  getCorporateDetailedSales(searchObj: AdminSearchObj): Observable<CorporateDetailedSales[]> {
    return this.http
      .get<CorporateDetailedSales[]>(`${this.totalSalesUrl}/corporate`, {
        params: {
          ...searchObj
        }
      })
      .pipe(catchError(handleError));
  }

  getProductCategoryDetailedSales(productCategoryIds: number[]): Observable<ProductCategoryDetailedSales[]> {
    return this.http
      .get<ProductCategoryDetailedSales[]>(`${this.totalSalesUrl}/product-category`, {
        params: {
          productCategoryIds
        }
      })
      .pipe(catchError(handleError));
  }


  getCorporateVehicleDetails(corporateId: number, searchObj: AdminSearchObj): Observable<VehicleReport[]> {
    return this.http
      .get<VehicleReport[]>(`${this.totalSalesUrl}/corporate/${corporateId}/vehicle`, {
        params: {
          ...searchObj,
        }
      })
      .pipe(catchError(handleError));
  }


  getCorporateCommissionDetails(searchObj: AdminSearchObj): Observable<CorporateCommission[]> {
    return this.http
      .get<CorporateCommission[]>(`${this.apiUrl}/corporate/commission`, {
        params: {
          ...searchObj,
        }
      })
      .pipe(catchError(handleError));
  }

  sendDate(date: any) {
    this.date = date;
    this.dateSubject.next(date);
  }

  getDate(): Observable<any> {
    return this.dateSubject.asObservable();
  }

  sendSelectedOuIds(ouIds: number[]) {
    this.ouIds = ouIds;
    this.ouIdsSubject.next(ouIds)
  }

  getSelectedOuIds() {
    return this.ouIdsSubject.asObservable();
  }

  addCommaToNumberValues(gridData): any[] {
    let newGridData = [];
    gridData.forEach((data)=>{
      Object.keys(data).forEach((key)=>{
        if(!isNaN(Number(data[key])) && key !== 'transactionItemId'){
          data[key] = data[key]?.toLocaleString("en-US")
        }
      })
      newGridData.push(data)
    })
    return newGridData
  }

  getCorporateBankStatement(searchObj: AdminSearchObj,
                            pageNo?: number,
                            pageSize?: number): Observable<BaseResponse<CorporateBankStatement>> {
    return this.http
      .get<BaseResponse<CorporateBankStatement>>(`${this.apiUrl}/accounting/statement`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize}),
        }
      })
      .pipe(
        catchError(handleError));
  }

}
