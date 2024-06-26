import { Base } from "@models/Base.model";

export class Bank extends Base {
  description: string;
  countryId: number;
}

export interface BankGridData {
  id: number;
  enName?: string;
  localeName?: string;
  country: string;
  status: string;
}
