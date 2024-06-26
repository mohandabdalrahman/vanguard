export interface CorporateAssetSearch<T> {
  fromDate?: number;
  toDate?: number;
  suspended?: boolean;
  enName?: string;
  localeName?: string;
  corporateId?: number;
  type?: T;
  assetTagId?: number;
  ids?: number[];
  assetPoliciesIds?: number[];
  vehicleCode?: string;
  nfcIds? : number [];
  ouIds? : number [];
}
