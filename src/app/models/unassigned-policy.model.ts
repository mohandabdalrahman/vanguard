export interface UnAssignedPolicySearch {
  corporateId: number;
  productCategoryId: number;
  numberOfCycle: number;
  creationFromDate: number;
  creationToDate: number;
  startFromDate: number;
  startToDate: number;
  endFromDate: number;
  endToDate: number;
  skipMileage: boolean;
  suspended: boolean;
  deleted: boolean;
  enName: string;
  assetType: string;
  policyType: string;
  policyCycleType: string;
  localeName: string;
  creatorId: number;
  zoneId: number[];
  cityId: number[];
  ids: number[];
  workingDays: string[];
  limitAmount: number;
  isExpired: boolean;
  ouIds?: number[];
  productCategoryIds: number[];
}
