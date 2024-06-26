import {AssetPolicy} from "@models/asset-policy.model";
import {AssetType} from "@models/asset-type";

export class CorporateHardware {
  assetType: string = AssetType.Hardware;
  corporateId: number;
  nfcId: number;
  assetTagId: number;
  assetPolicies: AssetPolicy[];
  authorizedUserIds: number[];
  description: string;
  suspended: boolean;
  id: number;
  ouId: number;
}
