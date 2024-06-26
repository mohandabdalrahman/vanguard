import { Base } from "@models/Base.model";

export class Country extends Base {
  description?: string;
  iso2Code: string = "";
  defaultLocale: string = "";
  currency: Currency = new Currency();
}

class Currency extends Base {
  description?: string;
  code: string = "";
}

export interface CountryGridData {
  id: number;
  enName?: string;
  localeName?: string;
  currency: string;
  status: string;
}
