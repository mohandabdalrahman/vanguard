import {AssetPolicy} from "@models/asset-policy.model";
import {AssetType} from "@models/asset-type";
import {Base} from "@models/Base.model";
import {FuelType} from "../corporate-vehicle/corporate-vehicle.model";

export class CorporateContainer extends Base {
  assetType: string = AssetType.Container;
  corporateId: number;
  nfcId: number;
  assetTagId: number;
  assetPolicies: AssetPolicy[];
  size: number;
  authorizedUserIds: number[];
  localeName: string;
  enName: string;
  description: string;
  fuelType: FuelType;
  ouId: number;
}

export interface CorporateContainerGridData {
  id: number;
  size: number;
  status: string;
}


