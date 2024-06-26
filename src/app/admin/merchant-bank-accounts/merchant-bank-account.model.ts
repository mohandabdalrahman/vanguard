import {Base} from "@models/Base.model";

export class MerchantBankAccount extends Base {
  description?: string = "";
  bankId?: number;
  branchAddress?: string = "";
  accountNumber?: string = "";
  iban?: string = "";
  swiftCode?: string = "";
  merchantId?: number;
}

export interface BankSelect {
  id: number;
  enName: string;
  localeName: string;
}

export interface MerchantBankAccountGridData {
  id: number;
  enName?: string;
  localeName?: string;
  branchAddress?: string;
  accountNumber?: string;
  status: string;
}

export interface MerchantBankAccountSearch{
  bankId?: number;
  branchAddress?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  enName?: string;
  localeName?: string;
}
