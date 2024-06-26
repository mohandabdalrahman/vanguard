import { Base } from "@models/Base.model";

export class BillingAccount extends Base {
  corporateId: number = null;
  accountTypeId: number = null;
  commissionRate: number = null;
  openingBalance: number = null;
  currentBalance: number = null;
  thresholdAmount: number = null;
  subscriptionAmount: number = null;
}

export class Topup extends Base {
  corporateId: number = null;
  amount: number = null;
  transactionReference: string = "";
  transactionDate: string = ""; // dd-MM-yyyy HH:mm:ss
}
