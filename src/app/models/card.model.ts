import {SharedProps} from "@models/Base.model";

export class Card extends SharedProps {
  relatedSystemId: number;
  relatedSystemType: string;
  serialNumber: string;
  expirationDate: string;
  virtual:boolean;
}

export interface CardSearch {
  ids?: number[];
  deleted?: boolean;
  fromDate?: number;
  toDate?: number;
  suspended?: boolean;
  creatorId?: string;
  serialNumber?: string;
  relatedSystemId?: number;
  assigned?: boolean;
  virtual?:boolean;
}

export interface CardGridData {
  id: number;
  serialNumber: string;
  expirationDate: string;
  status: string;
}


export interface AssignCard {
  relatedSystemId: number;
  nfcType?: NfcType;
  serialNumber?: string;
  expirationDate?: Date;
  userId: number;
  reissue?: boolean;
  virtual?: boolean;
}

export enum NfcType {
  NFC_TAG = 'NFC_TAG',
  CARD = 'CARD'
}
