import {Base, SharedProps} from "@models/Base.model";
import {BillingAccount} from "../corporate-billing-account/billing-account.model";

export class Corporate extends Base {
  description: string;
  corporateLevelId: number;
  countryId: number;
  cityId: number = null;
  zoneId: number = null;
  billingAddress: string = "";
  masterCorporateId: number;
  commercialRegistrationNumber: string;
  capitalValue: number = null;
  designation: string = "";
  legalrepresentativeId: number = null;
  legalrepresentativeName: string = "";
  taxId: string = "";
  documentType?: DocumentType;
  documents: Document[] = [];
  billingAccount: BillingAccount;
  rootOuId?: number;
  ouEnabled?: boolean;
}

export class CorporateSearch {
  localeName?: string;
  enName?: string;
  suspended?: boolean = true;
  countryId?: number;
  masterCorporateId?: number;
  accountTypeId?: number;
  commercialRegistrationNumber?: number;
  ids?: number[];
}

export interface CorporateOusSearch {
  corporateId: number;
  suspended: boolean;
  ouIds: number[];
}

export interface CorporateGridData {
  id: number;
  enName?: string;
  localeName?: string;
  country?: string;
  masterCorporate?: string;
  status: string;
  openingBalance?: number;
  subscriptionAmount?: number;
  currentBalance?: number;
}

export interface CorporateLevel extends Base {
  localeName: string;
  enName: string;
}

export interface MasterCorporate extends Base {
  description: string;
  countryId: number;
}

export enum DocumentType {
  COMMERCIAL_REGISTRATION = "COMMERCIAL_REGISTRATION",
  CONTRACT = "CONTRACT",
  TAX_FILE_NUMBER = "TAX_FILE_NUMBER",
  OTHER = "OTHER",
}

export class Document extends SharedProps {
  fileName?: string = "";
  fileContentBase64?: string;
  documentType?: DocumentType;
  documentFormat?: string;
  corporateId?: number;
}
