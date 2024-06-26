import {Base} from "@models/Base.model";

export interface CorporateAlert {
  id: number;
  assetId: number;
  corporateId: number;
  plateNumber: string;
  vehicleTypeEnName: string;
  vehicleTypeLocaleName: string;
  siteEneName: string;
  siteLocaleName: string;
  lastReadingDistance: number;
  currentOilTravelledDistance: number;
  alertType: AlertType;
  consumptionAlertType: string;
  descrption: string;
  authorizedUserEnNames: string;
  authorizedUserLocaleNames: string;
  lastOilChangeDate: string;
  transactionDate: string;
  creationDate: string;
  fuelOverConsumptionLiters : number;
  consumptionRate: number;
  corporateEnName?: string;
  corporateLocaleName?: string;
  alertIssueDate: string;
  licenseExpiryDate: string;
  daysTillLicenseExpiry: number;
  licenseRenewed: boolean;
  vehicleId:number;
  authorizedUsersEnNames: string;
  authorizedUsersLocaleNames: string;
  ouId: number;
}

export enum AlertType {
  OIL_CHANGE = "OIL_CHANGE",
  FUEL_CONSUMPTION_LIMIT = "FUEL_CONSUMPTION_LIMIT",
  TANK_SIZE_LIMIT = "TANK_SIZE_LIMIT",
  WRONG_DISTANCE_READING = "WRONG_DISTANCE_READING",
  VEHICLE_LICENSE_EXPIRY = "VEHICLE_LICENSE_EXPIRY",
}


export interface GenericAlertSearch {
  alertableDataId?: number;
  alertTypeId?: number;
  assetId?: number;
  ouIds?: number[];
  corporateIds?: number[];
}


export interface GenericAlert {
  id?: number;
  assetId?: number;
  corporateId?: number;
  ouId?: number;
  currentServiceTravelledDistance?: number;
  lastServiceChangeDate?: string;
  lastReadingDistance?: number;
  alertType?: GenericAlertType;
  creationDate?: string;
}

export interface GenericAlertType extends Base{
  description: string;
  alertableDataId: number;
  productCategoryId: number;
  data?: GenericAlert[];
  totalElements?: number;
}