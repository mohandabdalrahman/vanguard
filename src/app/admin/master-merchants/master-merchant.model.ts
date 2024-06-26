import {Merchant} from "../merchants/merchant.model";

export class MasterMerchant {
  id: number;
  enName: string = "";
  localeName: string = "";
  description: string = "";
  suspended: boolean = false;
  balance: number;
  merchants: Merchant[] = [];
}

export interface MasterMerchantGridData {
  id: number;
  enName?: string;
  localeName?: string;
  merchant: string;
  status: string;
}
