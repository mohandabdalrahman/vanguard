export class AdvanceSearch {
  countryId?: number;
  localeName?: string;
  enName?: string;
  suspended?: boolean = false;
  citiesIds?: number[];
  zoneIds?: number[];
}

export class BankAdvanceSearch extends AdvanceSearch {
  countryId: number;
}
