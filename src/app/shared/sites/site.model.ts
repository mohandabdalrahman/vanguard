import {Base} from "./../../models/Base.model";

export interface Site {
  id: number;
  enName: string;
  localName: string;
  country: string;
  zone: string;
  period: string;
  status: string;
}

export interface SiteBillingAccount{
  siteId: number;
  balance: number;
  minimumBalanceThreshold: number;
  lastNotified: string;
}

export class MerchantSite extends Base {
  id: number;
  localeName: string = '';
  enName: string = '';
  description: string = '';
  siteContacts: SiteContact[] = [];
  bankAccountId: number;
  productIds: [] = [];
  merchantId: number;
  address: string = '';
  countryId: number;
  cityId: number;
  zoneId: number;
  suspended: boolean;
  siteBillingAccount?: SiteBillingAccount
}

export class MerchantSiteSearchObj {
  id?: number;
  ids?: number[]=[];
  countryId?: number;
  cityId?: number;
  zoneId?: number;
  merchantId?: number;
  deleted?: boolean;
  fromDate?: number;
  toDate?: number;
  suspended?: boolean;
  enName?: string = "";
  creatorId?: string;
  localeName?: string = "";
  bankAccountId?: number;
}

export class SiteContact extends Base {

  id: number;
  suspended: boolean;
  deleted: boolean;
  creationDate: string;
  lastModifiedDate: string;
  creatorId: number;
  version: number;
  localeName: string = '';
  enName: string = '';
  description: string;
  siteId: number;
  contactTypeId: number = null;
  email: string = '';
  contactName: string = '';
  phoneNumber: string = '';
  faxNumber: string = '';
}




