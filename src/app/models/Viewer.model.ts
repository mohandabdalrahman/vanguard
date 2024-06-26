export interface viewer {
    id: number;
    suspended: boolean;
    deleted: boolean;
    creationDate: string;
    lastModifiedDate?: any;
    creatorId: number;
    version: number;
    localeName: string;
    enName: string;
    description?: string;
    username: string;
    email: string;
    mobileNumber: string;
    address?: string;
    typeId: number;
    nfcIds: any[];
    nfcId?: any;
    relatedSystemId?: any;
    masterSystemId?: any;
    roles: (Role | Roles2)[];
  }
  
  export interface Roles2 {
    id: number;
    suspended: boolean;
    deleted: boolean;
    creationDate: string;
    lastModifiedDate: string;
    creatorId: number;
    version: number;
    localeName: string;
    enName: string;
    description?: any;
    systemType: string;
    securityProfiles: SecurityProfile[];
    mandatoryFields: any[];
    tag?: any;
  }
  
  export interface Role {
    id: number;
    suspended: boolean;
    deleted: boolean;
    creationDate: string;
    lastModifiedDate: string;
    creatorId: number;
    version: number;
    localeName: string;
    enName: string;
    description?: string;
    systemType: string;
    securityProfiles: SecurityProfile[];
    mandatoryFields: any[];
    tag?: any;
  }
  
  export  interface SecurityProfile {
    id: number;
    value: string;
    description: string;
  }
  
  