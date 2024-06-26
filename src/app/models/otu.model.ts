import {SharedProps} from "@models/Base.model";

export interface Otu extends SharedProps {
  merchantId: number;
  SITE_ID: number;
  DEVICE_ID: string;
}

export interface OtuSearchCriteriaDto  {
  merchantId: number;
  siterId:number;
  deviceId: number;
}
