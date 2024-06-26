import { DepositType } from "../merchants/merchant.model";

export class MerchantBillingAccount {
  id: number = null;
  merchantId: number = null;
  balance: number = null;
  LastDepositDate: string = null;
  LastDepositAmount: number = null;
  masterMerchantBalance: number = null;
  version: number = null;
  depositType: DepositType;

}
