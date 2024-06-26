import {SharedProps} from "../../models/Base.model";

export class MerchantDeposit extends SharedProps {
  depositDate: string;
  depositAmount: number;
  depositReference: string = "";
  siteId?: number;
  merchantId?: number;
}

export interface MerchantDepositSearch {
  merchantId: number;
}