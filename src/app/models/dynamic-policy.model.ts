import {AssetType} from "@models/asset-type";

export interface DynamicPolicy {
  policyId: number;
  assetId: number;
  remainingAmount: number;
  policyAssetType: AssetType;
}