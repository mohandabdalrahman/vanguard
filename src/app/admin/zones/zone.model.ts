import {Base} from "@models/Base.model";

export class Zone extends Base {
  description: string;
  cityId: number;
}

export interface ZoneGridData {
  id: number;
  enName?: string;
  localeName?: string;
  status: string;
}
