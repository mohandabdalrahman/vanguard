import {Base} from "@models/Base.model";

export class UserRole extends Base {
  suspended: boolean = false;
  description?: string = "";
  securityProfiles?: SecurityProfile[];
  systemType: SystemType;
  "mandatoryFields": [
    {
      "id": 0,
      "field": "string"
    }
  ];
  tag: RoleTag;
}

export class SecurityProfile {
  id?: number;
  value?: string;
  description?: string;
}

export interface UserRoleGridData {
  id: number;
  enName?: string;
  localeName?: string;
  description: string;
  status: string;
}

export enum SystemType {
  Admin = "ADMINISTRATION",
  merchant = "MERCHANT",
  corporate = "CORPORATE"
}

export enum RoleTag {
  salesPerson = "SALES_PERSON",
  siteManager = "SITE_MANAGER",
  CARDHOLDER = 'CARDHOLDER',
  OU_ADMIN = 'OU_ADMIN'
}