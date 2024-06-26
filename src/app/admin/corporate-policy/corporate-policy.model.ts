import { Base } from "@models/Base.model";

export class CorporatePolicy extends Base {
  description: string;
  policyType: string;
  policyCycleType: string;
  customCycleDays: number = null;
  amount: number;
  limitPerTransaction: number;
  limitPerDay: number;
  maxNumberOfTransactionPerDay: number;
  maxNumberOfTransactionPerCycle: number;
  cyclePlannedUsage?:number;
  cycleConsumption?:number;
  monthlyConsumption?:number;
  monthlyPlannedUsage?:number;
  startDate: string;
  endDate: string;
  numberOfCycle: number = null;
  applyTime: string;
  productCategoryId: number;
  assetType: string;
  corporateId: number;
  skipMileage: boolean;
  workingDays: string[];
  zones: number[];
  cities: number[];
  ouId: number;
  openned?: boolean;
}

export interface CorporatePolicySearch {
  corporateId?: number;
  productCategoryIds?: number[];
  numberOfCycle?: number;
  creationFromDate?: number;
  creationToDate?: number;
  startFromDate?: number;
  startToDate?: number;
  endFromDate?: number;
  endToDate?: number;
  skipMileage?: boolean;
  assetType?:string ;
	policyType?:string ;
  policyCycleType?:string;
  suspended?: boolean;
  enName?: string;
  localeName?: string;
  ids?: number[];
  workingDays?:string[];
	limitAmount?:number;
  zoneId?:number[];
	cityId?:number[];
  ouIds?:number[];
}

export interface CorporatePolicyGridData {
  id: number;
  enName?: string;
  localeName?: string;
  policyType: string;
  policyCycleType: string;
  productCategory: string;
  assetType: string;
  status: string;

}

export enum PolicyType {
  oneTime = "ONE_TIME",
  recurring = "RECURRING",
  daily = "DAILY",
}

export enum PolicyCycleType {
  daily = "DAILY",
  weekly = "WEEKLY",
  monthly = "MONTHLY",
  annual = "ANNUAL",
  custom = "CUSTOM",
}

export enum WorkingDays {
  saturday = "SATURDAY",
  sunday = "SUNDAY",
  monday = "MONDAY",
  tuesday = "TUESDAY",
  wednesday = "WEDNESDAY",
  thursday = "THURSDAY",
  friday = "FRIDAY",
}

export enum ApplyTime {
  immediate = "IMMEDIATE",
  nextCycle = "NEXT_CYCLE",
}

export enum Limit {
  limit = "LIMIT",
  noLimit = "NO_LIMIT",
}

export interface PolicyUsers{
    id: number;
    policyId: number;
    assetId: number;
    productCategoryId: number;
    remainingAmount?: number;
    remainingLimitPerDay?: any;
    limitPerTransaction?: number;
    eligibility?: any;
    remainingNumberOfTransactionPerDay?: any;
    remainingNumberOfTransactionPerCycle?: any;
    remainingNumberOfCycle?: any;
    monthlyConsumption: number;
    cycleConsumption: number;
    nextCycleDate?: string;
    startDate: string;
    endDate?: any;
    policyAssetType?: any;
    manexErrorCode?: any;
    skipMileage?: any;
    deleted: boolean;
}
