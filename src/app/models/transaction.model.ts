import {MerchantProduct} from "@shared/merchant-products/merchant-product.model";
import {ProductCategory} from "../admin/product/product-category.model";
import {CorporatePolicy} from "../admin/corporate-policy/corporate-policy.model";
import {AssetType} from "@models/asset-type";
import {Base, SharedProps} from "@models/Base.model";
export interface Transaction {
  id: number;
  merchantId: number;
  corporateId: number;
  amount: number;
  commissionAmount: number;
  totalAmount: number;
  salesPersonId: number;
  cardHolderId: number;
  otuId: number;
  shiftId: number;
  siteId: number;
  settled: boolean;
  status: string;
  statusReason: string;
  uuid: string;
  transactionItems: TransactionItem[];
  creationDate: string;
  lastModifiedDate: string;
  vatAmount: number;
  netAmount: number;
  ouId: number;
  newMileage?:number;
  reviewStatus: TransactionReviewStatus;
}

export interface TransactionItem {
  id: number;
  productId: number;
  productCategoryId: number;
  assetId: number;
  assetNfcId: number;
  policyId: number;
  currentMileage: number;
  amount: number;
  vatAmount: number;
  quantity: number;
  unitPrice: number;
  comment: string;
  mileageDocument: MileageDocument;
}

export interface MileageDocument {
  id: number;
  suspended: boolean;
  deleted: boolean;
  creationDate: string;
  lastModifiedDate: string;
  creatorId: number;
  version: number;
  fileName: string;
  documentType: string;
  documentFormat: string;
  merchantId: number;
  fileContentBase64: string;
}

export interface TransactionSearch {
  fromDate?: number;
  toDate?: number;
  corporateId?: number;
  merchantId?: number;
  settled?: boolean;
  salesPersonId?: number;
  cardHolderId?: number;
  otuId?: number;
  shiftId?: number;
  siteId?: number;
  status?: string;
  statusReason?: string;
  uuid?: string;
  transactionIds?: number[];
  amountFrom?: string;
  amountTo?: string;
  amount?: string;
  ouIds?: number[];
  ouId?: number;
  policyIds?: number[];
}

export interface TransactionItemData {
  id: number;
  assetId?: number;
  product: MerchantProduct;
  productCategory: ProductCategory;
  policy?: CorporatePolicy;
  amount: number;
  vatAmount?: number;
  netAmount?: number;
  quantity: number;
  unitPrice: number;
  containerId?: number;
  hardwareId?: number;
  plateNumber?: string;
  currentMileage?: number;
  assetType?: AssetType;
}

export enum Status {
  successEn = "SUCCESS",
  failureEn = "FAILURE",
  failureEn2 = "FAILED",
  successAr = "نجحت",
  failureِAr = "فشلت",
}


export interface TransactionMileage {
  transactionId?: number;
  transactionItemId?: number;
  merchantId: number;
  corporateId: number;
  newMileageReading: number;
  oldMileageReading: number;
}

export interface LatestTransactionInfo {
  assetId: number;
  latesTrxAmount: number;
  latestTrxItemQuantity: number;
  latestTrxDate: string;
}

export enum ReviewStatus {
  FAILED = "FAILED",
  PASSED = "PASSED"
}

export enum TransactionReviewStatus {
  PASSED = "PASSED",
  FAILED = "FAILED",
  NOT_REVIEWED = "NOT_REVIEWED"
}

export interface RejectReason extends Base{
  description: string;
  tag: string;
}

export interface AcceptedTransaction {
  transactionUuid?: string,
  transactionId?: number,
  reviewStatus?: ReviewStatus,
  tipsAccepted ?: boolean,
  reviewNotes ?: string,

}

export interface RejectedTransaction extends AcceptedTransaction {
  rejectedMileageReading?: number,
  updatedMileage?: number,
  currentTransactionAmount ?: number,
  updatedTransactionAmount ?: number,
  rejectionReasons?;
}

export interface TipsSearchDto {
  transactionIds?:number[]
  trxType?: string;
  tipStatus?: string;
}
 
export interface TipsDto extends SharedProps{
  siteId: number,
  trxUuid: string,
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  trxType: string,
}

export interface TransactionsTips{
  acceptedTipsTransactions ?: number[];
  rejectedTipsTransactions ?: number[];
}

export interface VehicleDistance {
  assetId: number,
  transactionId: number,
  transactionVehicleDistance: number,
  updatedVehicleDistance: number
}

export interface TransactionReview {
  id: number;
  transactionUuid: string;
  transactionId: number;
  reviewStatus: string;
  reviewerId: number;
  creationDate: string;
  lastModifiedDate: string;
  rejectedMileageReading: number;
  updatedMileage: number;
  currentTransactionAmount: number;
  updatedTransactionAmount: number;
  transactionCorporateId: number;
  transactionCardHolderId: number;
  transactionMerchantId: number;
  transactionSiteId: number;
  transactionCreationDate: string;
  rejectionReasons: RejectionReason[];
}

export interface TransactionReviewSearch {
  
  transactionUuid?: string;
  reviewStatus?: string;
  reviewerId?: number;
  creationDate?: string;
  transactionCorporateId?: number;
  transactionCardHolderId?: number;
  transactionMerchantId?: number;
  transactionSiteId?: number;
  transactionCreationDate?: string;
  
}

interface RejectionReason {
  rejectionReasonId: number;
  transactionId: number;
}

// export interface UnReviewedTransaction {
//   transactionUuid:string;
//   transactionId: number,
//   siteId: number;    
//   corporateId:number;
//   merchantId:number;
//   cardholderId:number;
// }

export class CorporateReviewLog {
  transactionUuid:string;
  transactionId: number;
  reviewStatus: ReviewStatus;
  reviewNotes: string;
}

export class ExtendedCorporateReviewLog extends CorporateReviewLog{
  milage: number;
  amount: number;
}

export interface ReviewedTransction{
  trxId:number;
  trxData:{
    amount: number;
    uuid: string;
    merchantId: number;
    siteId: number;
    corporateId:number;
    creationDate: string;
    salesPersonId:number;
    merchantName:{
      en:string,
      ar:string
    };
    siteName:{
      en:string,
      ar:string
    };
    corporateName:{
      en:string,
      ar:string
    };
    productCategoryName?:{
      en:string,
      ar:string
    };
    
    transactionItems: TransactionItem[];
  };
  tips:{
    hasTips:boolean;
    tipsObject:{
      amount:number;
      balanceAfter:number;
      balanceBefore:number;
      creationDate:string;
      creatorId:number;
      id:number;
      siteId:number;
      tipStatus:string;
      transactionId:string;
      trxType:string;
      trxUuid:string;
    }
  };
  reviewAction?:{
    accepted:boolean;
    tipsAccepted:boolean;
    reviewNotes:string;
    newAmount?:number;
    newMileage?:number;
    rejectionReasonIds?:number[]
  }
}