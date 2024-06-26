export interface AssetPolicy {
  policyId: number;
  productCategoryId?: number;
  remainingAmount?: number;
  remainingLimitPerDay?: number;
  remainingNumberOfTransactionPerDay?: number;
  remainingNumberOfTransactionPerCycle?: number;
  remainingNumberOfCycle?: number;
  cycleConsumption?: number;
  nextCycleDate?: string;
  startDate?: string;
  endDate?: string;
  policyAssetType?: string;
  groupPolicy?: boolean;
}

export interface OuAssetCountDto {
  ouId: number;
  assetCounts: any;
}
