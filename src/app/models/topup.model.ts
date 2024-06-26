import { SharedProps } from "@models/Base.model";
import { Pageable, Sort } from "./reports.model";

export interface TopUp extends SharedProps {
  corporateId: number;
  amount: number;
  transactionReference: string;
  transactionDate: string;
  corporateEName?: string;
  corporateLocaleName?: string;
  CREATION_DATE?: string;
}

export interface TopUpReport {
  topUpList?: TopUp[];
  topUpPage?: TopUpPage;
  totalAmounts: number;
}

export interface TopUpPage {
  totalElements: number;
  totalPages: number;
  number: number;
  sort: Sort;
  size: number;
  content: TopUp[];
  pageable: Pageable;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
