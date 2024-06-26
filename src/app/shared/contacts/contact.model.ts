import {Base} from "@models/Base.model";

export class Contact extends Base {
  description: string;
  contactTypeId: number;
  email: string = "";
  mailingList: string = "";
  phoneNumber: string;
  faxNumber: string;
  officeNumber: string;
  mobileNumber: string;
  merchantId: number;
}

export interface ContactSearch {
  deleted?: boolean;
  contactTypeId?: number;
  email?: string;
  mailingList?: string;
  localeName?: string;
  enName?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  officeNumber?: string;
  merchantId?: number;
}

export interface ContactGridData {
  id: number;
  enName?: string;
  localeName?: string;
  officeNumber: string;
  faxNumber: string;
  mobileNumber: string;
  contactType: string;
  status: string;
}
