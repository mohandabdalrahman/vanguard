import {SharedProps} from "@models/Base.model";
import { Site } from "@shared/sites/site.model";

export interface Tips extends SharedProps {
  merchantId: number;
  siteId:number;
  amount:number;
  trxUuid:string;
  transactionId:string;
  balanceBefore:number;
  balanceAfter:number;
  trxType:TipTypeEnum;
  tipStatus?: TipStatusEnum;
  creatorId:number;

}
export interface TipsGridData extends Tips{
  site: Site,
  tipType:string
  username: string;
  trxReviewStatus: TipStatusEnum;
}

export class TipsSearchCriteriaDto  {
  merchantId: number;
  siterId:number;
  trxType: string;
}

export enum TipTypeEnum{
  ADD, RELEASE
}

export enum TipStatusEnum{
  IN_REVIEW, ACCEPTED, REJECTED
}