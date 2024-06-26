import { Base } from "./Base.model";

export interface ProductType extends Base {
  description: string;
  holdingTaxPercent:number;
}

