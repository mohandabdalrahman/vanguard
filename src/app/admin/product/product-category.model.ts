import {Base} from "@models/Base.model";

export class ProductCategory extends Base {
  description: string = "";
  measurementUnitId: number;
  countryId: number;
  price: number;
  globalProductTypeId: number;
  categoryTag: CategoryTag;

  constructor(public global: boolean) {
    super();
  }
}

export class ProductSearch {
  enName?: string;
  localeName?: string;
  price?: number;
  countryId?: number;
  measurementUnitId?: number;
  suspended?: boolean = false;
  productIds?: number[] = [];
  ids?: number[] = [];

  constructor(public global?: boolean) {
  }
}

export interface ProductGridData {
  id: number;
  enName?: string;
  localeName?: string;
  price?: number;
  country?: string;
  status: string;
}

export enum CategoryTag {
  oil = "OIL",
  fuel = "FUEL",
  maintenance = "MAINTENANCE",
}


