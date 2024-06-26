export interface CorporateBill {
  id: number;
  corporateId: number;
  corporateEnName: string;
  corporateLocaleName: string;
  totalSalesAmount: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  vatAmount: number;
  fromDate: string;
  toDate: string;
}

export interface CorporateBillSearch {
  corporateId: number | number[];
  corporateEnName: string;
  corporateLocaleName: string;
  fromDate: number;
  toDate: number;
}

export interface CorporatesTopUpsSearch {
  corporateIds?: number[];
  transactionReference?: string;
  transactionDateFrom?: number;
  transactionDateTo?: number;
}
