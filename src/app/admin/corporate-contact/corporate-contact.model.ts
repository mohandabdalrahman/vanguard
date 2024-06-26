import { Base } from "@models/Base.model";

export class CorporateContact extends Base {
  suspended: boolean = false;
  description: string;
  contactTypeId: number;
  officeNumber: string = "";
  faxNumber: string;
  mobileNumber: string = "";
  email: string = "";
  mailingList: string = "";
  corporateId: number;
}

export class CorporateContactSearch {
  localeName: string = "";
  enName: string = "";
  suspended: boolean;
  contactTypeId: number;
  officeNumber: string = "";
  faxNumber: string;
  mobileNumber: string = "";
  email: string = "";
  mailingList: string = "";
}


