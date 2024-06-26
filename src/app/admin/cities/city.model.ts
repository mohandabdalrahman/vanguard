import {Base} from "@models/Base.model";

export class City extends Base {
  description: string;
  countryId: number;
}

export interface CityGridData {
  id: number;
  enName?: string;
  localeName?: string;
  status: string;
}
