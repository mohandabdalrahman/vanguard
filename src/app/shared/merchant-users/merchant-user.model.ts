import {Base} from "@models/Base.model";
import {UserRole} from "app/admin/user-roles/user-role.model";

export class MerchantUser extends Base {
  description: string;
  username: string = "";
  email: string ="";
  mobileNumber: string = "";
  phoneNumber: string;
  address: string;
  typeId: number;
  nfcId: number;
  relatedSystemId: number;
  roles: UserRole[];
  siteId: number;
  merchantUserId: string=null;
  preferredLanguage: string=null;
  fLocaleName = "";
  lLocaleName = "";
  mLocaleName = "";
  fEnName = "";
  lEnName = "";
  mEnName = "";
}
