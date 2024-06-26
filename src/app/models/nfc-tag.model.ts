import {SharedProps} from "@models/Base.model";

export interface NfcTag extends SharedProps {
  relatedSystemId: number;
  relatedSystemType: string;
  nfcType: string;
  serialNumber: string;
  expirationDate: string;
}