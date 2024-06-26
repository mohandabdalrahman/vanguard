import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {BaseResponse} from "@models/response.model";
import {
  LatestTransactionInfo,
  RejectReason,
  TipsDto,
  TipsSearchDto,
  Transaction,
  TransactionMileage,
  TransactionReview,
  TransactionReviewSearch,
  TransactionSearch,
  TransactionsTips,
  VehicleDistance
} from "@models/transaction.model";
import {Observable, Subject} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TransactionService {
 
  apiUrl: string;
  private ouIdSubject = new Subject<any>();
  ouId: number;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseUrl}/transaction-service/transaction`;
  }

  getTransactions(
    merchantId?: number,
    corporateId?: number,
    searchObj?: TransactionSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string
  ): Observable<BaseResponse<Transaction>> {
    return this.http
      .get<BaseResponse<Transaction>>(`${this.apiUrl}`, {
        params: {
          ...(merchantId && { merchantId }),
          ...(corporateId && { corporateId }),
          ...searchObj,
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(sortDirection && { sortDirection }),
          ...(sortBy && { sortBy }),
        },
      })
      .pipe(catchError(handleError));
  }

  getUnreviewedTransactions(
    firstTimeReview: boolean,
    pageSize?: number
    
  ): Observable<BaseResponse<Transaction>> {
    return this.http
      .get<BaseResponse<Transaction>>(`${environment.baseUrl}/transaction-service/transaction-review/unreviewed-transactions`, {
        params: {
          ...(pageSize && {pageSize}),
          firstTimeReview
        },
      })
      .pipe(catchError(handleError));
  }


  getCorporateUnreviewedTransactions(
    corporateId: number,
    pageNo: number,
    pageSize?: number,
    ouId?: number
  ): Observable<BaseResponse<Transaction>> {
    return this.http
      .get<BaseResponse<Transaction>>(`${environment.baseUrl}/transaction-service/corporate/${corporateId}/transaction-review/unreviewed`, {
        params: {
          ...(pageSize && {pageSize}),
          ...(pageNo && {pageNo}),
          ...(ouId && {ouId}),
        },
      })
      .pipe(catchError(handleError));
  }

  getTransaction(transactionId: number): Observable<Transaction> {
    return this.http
      .get<Transaction>(`${this.apiUrl}/${transactionId}`)
      .pipe(catchError(handleError));
  }

  updateTransactionMileage(transactionId: number, transactionItemId: number, mileage: TransactionMileage): Observable<TransactionMileage> {
    return this.http
      .patch<TransactionMileage>(`${this.apiUrl}/${transactionId}/item/${transactionItemId}`, mileage)
      .pipe(catchError(handleError));
  }


  getAssetTransactionsInfo(corporateId: number, assetIds: number[]): Observable<LatestTransactionInfo[]> {
    return this.http
      .get<LatestTransactionInfo[]>(`${this.apiUrl}/corporate/${corporateId}/latest`, {
        params: {
          assetIds: assetIds.join(',')
        }
      })
      .pipe(catchError(handleError));
  }

  getRejectReasons(): Observable<BaseResponse<RejectReason>> {
    return this.http
      .get<BaseResponse<RejectReason>>(`${environment.baseUrl}/lookup-service/transaction-review/rejection-reasons`)
      .pipe(catchError(handleError));
  }

  getTipsList(
    searchObj?: TipsSearchDto,
    pageNo: number = 0,
    pageSize?: number,
  ): Observable<BaseResponse<TipsDto>> {
    return this.http
      .get<BaseResponse<TipsDto>>(`${environment.baseUrl}/merchant-service/tips`, {
        params: {
          ...searchObj,
          ...(pageNo && {pageNo}),
          ...(pageSize && {pageSize})
        }
      })
      .pipe(catchError(handleError));
  }

  createTransactionReviews(
    transactionReviewLog?
  ): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/transaction-service/transaction-review`, transactionReviewLog)
      .pipe(catchError(handleError));
  }

  createCorporateTransactionReviews(
    corporateId: number,
    transactionReviewLog?
  ): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/transaction-service/corporate/${corporateId}/transaction-review`, transactionReviewLog)
      .pipe(catchError(handleError));
  }

  updateVehicleDistance(
    vehicleDistanceList: VehicleDistance[]
  ): Observable<VehicleDistance> {
    return this.http
      .put<VehicleDistance>(
        `${environment.baseUrl}/corporate-orchestration-service/asset/vehicle/distance`,
        vehicleDistanceList
      )
      .pipe(catchError(handleError));
  }

  updateTransactionsTips(
    transactionsTips: TransactionsTips
  ): Observable<TransactionsTips> {
    return this.http
      .put<TransactionsTips>(
        `${environment.baseUrl}/merchant-service/tips`,
        transactionsTips
      )
      .pipe(catchError(handleError));
  }

  sendSelectedOuId(ouId: number) {
    this.ouId = ouId;
    this.ouIdSubject.next(ouId)
  }

  getSelectedOuId() {
    return this.ouIdSubject.asObservable();
  }

  getTransactionReport(
    searchObj? :TransactionReviewSearch,
    pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string): Observable<BaseResponse<TransactionReview>>  {

    return this.http.get<BaseResponse<TransactionReview>>(`${this.apiUrl}-review`, {
      params: {
        ...searchObj,
        ...(pageNo && { pageNo }),
        ...(pageSize && { pageSize }),
        ...(sortDirection && { sortDirection }),
        ...(sortBy && { sortBy }),
      },
    }).pipe(catchError(handleError))
  }
  
  getCorporateTransactionReport(corporateId:number,pageNo?: number,
    pageSize?: number,
    sortDirection: string = "DESC",
    sortBy?: string): Observable<BaseResponse<TransactionReview>>  {


      return this.http.get<BaseResponse<TransactionReview>> (`${environment.baseUrl}/transaction-service/corporate/${corporateId}/transaction-review`,
      {
        params: {
          ...(pageNo && { pageNo }),
          ...(pageSize && { pageSize }),
          ...(sortDirection && { sortDirection }),
          ...(sortBy && { sortBy })
        }
      })


    }

    getCurrentlyInReviewTransactions(key: string) : Observable<Map<string,number[]>> {
      return this.http.get<Map<string,number[]>> (`${environment.baseUrl}/transaction-service/transaction-review/redis-value`, {params: {key}});
    }

    releaseReviewTransactionsForUser(userId: number) {
      return this.http.delete(`${environment.baseUrl}/transaction-service/transaction-review/currently-reviewed-transactions`, {params:{userId}})
      .pipe(catchError(handleError));;
    }
}
