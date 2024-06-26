import {SharedProps} from "@models/Base.model";


export class Document extends SharedProps {
  fileName?: string = "";
  fileContentBase64?: string;
  documentType?: DocumentType;
  documentFormat?: string;
  merchantId?: number;
}


export enum DocumentType {
  COMMERCIAL_REGISTRATION = "COMMERCIAL_REGISTRATION",
  CONTRACT = "CONTRACT",
  TAX_FILE_NUMBER = "TAX_FILE_NUMBER",
  OTHER = "OTHER",
}