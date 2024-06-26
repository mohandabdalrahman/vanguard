import { Base } from "./Base.model";

export interface Policy extends Base {
  description: string;
  policyType: PolicyType;
  policyCycleType: string;
  customCycleDays: number;
  amount: number;
  limitPerTransaction: number;
  limitPerDay: number;
  maxNumberOfTransactionPerDay: number;
  maxNumberOfTransactionPerCycle: number;
  startDate: string;
  endDate: string;
  numberOfCycle: number;
  applyTime: string;
  productCategoryId: number;
  assetType: string;
  corporateId: number;
  skipMileage: boolean;
  workingDays: string[];
  zones: number[];
  cities: number[];
}

export enum PolicyType {
  oneTime = "ONE_TIME",
  recurring = "RECURRING",
  dynamic = "DYNAMIC",
}
