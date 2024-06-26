import { AssetPolicy } from "./asset-policy.model";
import { Base } from "./Base.model";

export class CardHolder extends Base {
  assetType: string;
  corporateId: number;
  cardId: number;
  assetTagId: number;
  assetPolicies: AssetPolicy[];
  corporateUserId: number;
  enName: string;
  localeName: string;
  nfcIds: number[];
  version: number;
  suspended?: boolean;
  ouId?: number;
}

export interface CardHolderGridData {
  id: number;
  corporateId?:number;
  name?: string;
  serialNumber?: number;
  cardExpiry?: string;
  userCorporateId: number;
  assignedPolicy: string;
  assetTag: string;
  status: string;
  virtualCardLabel?:string;
  virtualSerialNumber?:string;
  cardHolderEnName?:string;
  cardHolderLocalName?:string;
  ouName?:string;
  settled?:boolean;
}
