import {UserRole} from "app/admin/user-roles/user-role.model";
import {Base} from "./Base.model";

export class User extends Base {
  suspended: boolean = false;
  description: string;
  username: string = "";
  email: string = "";
  mobileNumber: number = null;
  phoneNumber: string;
  address: string;
  typeId?: number;
  cardId?: number;
  relatedSystemId?: number;
  roles: UserRole[] = [];
  preferredLanguage?: string = null;
  corporateUserId?: string = null;
  fLocaleName = "";
  lLocaleName = "";
  mLocaleName = "";
  fEnName = "";
  lEnName = "";
  mEnName = "";
  nfcIds: number[];
  ouId?: number;
}

export class UserSearchObj {
  cardId?: number;
  userIds?: number[];
  creatorId?: number;
  fromDate?: number;
  toDate?: number;
  type?: string;
  username?: string;
  enNmae?: string;
  localName?: string;
  mobileNumber?: string;
  suspended?: boolean;
  relatedSystemId?: number;
  roleTag?: string;
  ouId?: number;
  ouIds?: number | number[];
}

export interface UserGridData {
  id: number;
  username: string;
  enName?: string;
  localeName?: string;
  userRole: string | void;
  mobileNumber: string | number;
  status: string;
}

export interface UnassignedUser extends Base {
  description: string;
  username: string;
  email: string;
  mobileNumber: string;
  address: string;
  typeId: number;
  cardId: number;
  nfcId: number;
  relatedSystemId: number;
  roles: UserRole[];
  corporateUserId: number;
  virtualCard: Boolean;
}

export interface UserCount {
  ouId: number;
  count: number;
}

export interface OuRoleUserNamesDto {
  ouId: number;
  userId: number;
  localeName: string;
  enName: string;
}

export type CorporateOuAdmins = Map<number, OuRoleUserNamesDto[]>