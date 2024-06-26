import {AssetPolicy} from "@models/asset-policy.model";
import {AssetType} from "@models/asset-type";
import {Base, SharedProps} from "@models/Base.model";
import {GenericAlert} from "../corporate-alert/corporate-alert.model";

export class CorporateVehicle extends Base {
  assetType: string = AssetType.Vehicle;
  corporateId: number;
  nfcId: number;
  assetTagId: number;
  assetPolicies: AssetPolicy[];
  plateNumber: string = "";
  vehicleTypeId: number = null;
  allUsersAuthorized:Boolean;
  //startingMilage: number;
  tankSize: number;
  consumptionHighRate: number;
  consumptionDefaultRate: number;
  consumptionLowRate: number;
  authorizedUserIds: number[];
  description: string;
  fuelType: FuelType;
  changingOilMilage: number;
  originCity: string;
  servicePeriodInMonth: number;
  modelYear: string = "";
  brand: string = "";
  averageMilagePerDay: number;
  vehicleCode: string = "";
  ouId: number;
  licenseExpiryDate: string = "";
  lastDistanceReading: number;
  alertableData?: AlertableData[];
  averageCalculatedConsumption: number;
}

export interface AlertableData {
  id?: number;
  alertableDataId: number;
  alerteableFieldEnName: string;
  alerteableFieldLocaleName: string;
  claimingDistance: number;
  claimingNumberOfDays: number;
  lastChangedDate: string;
  lastChangedReadingDistance: number;
  productCategoryId?: number;
  data?: GenericAlert[];
}

export interface CorporateVehicleGridData {
  id: number;
  vehicleTypeId?: number;
  enName?: string;
  localeName?: string;
  plateNumber: string;
  status: string;
}

export interface VehicleType extends Base {
  description: "string";
}

export enum FuelType {
  gas = 'GASOLINE',
  diesel = "DIESEL"
}

export class ManualReview extends SharedProps {
  corporateId: number;
  productCategoryId: number;
  assetId: number;
  ouId: number;
  currentReadingDistance: number;
  price: number;
  note: string;
  maunalReviewDate: string;
}


export interface ManualMileage {
  id?: number;
  lastMileage: number;
  currentMileage: number;
  mileageCalibrationDate?: string;
  calibratedBy?: string;
  updateVehicleMileage?: boolean;
  assetId: number;
}