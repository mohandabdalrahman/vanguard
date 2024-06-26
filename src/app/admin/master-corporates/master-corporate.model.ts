import { Base } from "@models/Base.model";

export class MasterCorporate extends Base {
  description: string;
}

export interface MasterCorporateGridData {
  id: number;
  enName?: string;
  localeName?: string;
  description: string;
  status: string;
}
