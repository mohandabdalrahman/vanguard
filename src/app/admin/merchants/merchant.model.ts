import {Base} from "@models/Base.model";
import {Document} from "@models/document.model";

export class Merchant extends Base {
  description: string;
  commercialRegisterationNumber: string = "";
  capitalValue: number = null;
  masterMerchantId: number;
  taxId: string = "";
  commissionRate = 0;
  countryId: number = null;
  cityId: number = null;
  zoneId: number = null;
  billingAddress: string = "";
  invoicePeriodDays: number = null;
  documents: Document[] = [];
  designation: string = "";
  legalrepresentativeId: string = "";
  legalrepresentativeName: string = "";
  skipHoldingTax: boolean = false;
  currentBalance?: number;
  depositTypeEnum : DepositType;
}

export enum DepositType {
  MERCHANT_DEPOSIT = "MERCHANT_DEPOSIT",
  SITE_DEPOSIT="SITE_DEPOSIT"
}

export interface MasterSearch {
  id?: number;
  ids?: number[];
  countryId?: number;
  deleted?: boolean;
  fromDate?: number;
  toDate?: number;
  suspended?: boolean;
  enName?: string;
  localeName?: string;
  masterMerchantId?: number;
  crNumber?: string;
}

export interface MerchantGridData {
  id: number;
  enName?: string;
  localeName?: string;
  masterMerchant: string;
  status: string;
}
