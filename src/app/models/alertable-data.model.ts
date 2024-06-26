import {AssetType} from "@models/asset-type";
import {Base} from "@models/Base.model";

export enum AlertMeasurement {
  TIME = "TIME",
  DISTANCE = "DISTANCE",
  TIME_OR_DITANCE = "TIME_OR_DITANCE",
}

export interface AlertableDataDto extends Base {
  description: string;
  productCategoryId: number;
  assetType: AssetType;
  alertMeasurement: AlertMeasurement;
}