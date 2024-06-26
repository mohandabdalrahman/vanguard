import {Base} from "@models/Base.model";

export class MerchantProduct extends Base {
  description: string;
  productCategoryId: number;
  merchantId: number;
  valueAddedTaxPercent: number;
  productTypeId:number;
  measurementUnitId:number;
}

export interface MerchantProductSearch {
  merchantId?: number;
  productCategoryId?: number;
  fromDate?: number;
  toDate?: number;
  suspended?: boolean;
  enName?: string;
  localeName?: string;
  creatorId?: number;
  ids?: number[];
}

export interface MerchantProductGridData {
  id: number;
  enName?: string;
  localeName?: string;
  category: string;
  valueAddedTaxPercent: number;
  status: string;
}
