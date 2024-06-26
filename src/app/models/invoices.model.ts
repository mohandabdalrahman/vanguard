import {SharedProps} from "@models/Base.model";

export interface Invoice extends SharedProps {
  serialNumber: string;
  merchantLocaleName: string;
  siteLocaleName: string;
  merchantEnName: string;
  corporateEnName: string;
  siteEnName: string;
  corporateLocaleName: string;
  merchantTaxId: string;
  corporateTaxId: string;
  corporateId: number;
  merchantId: number;
  siteId: number;
  siteAddress: string;
  settled: boolean;
  status: string;
  invoiceProducts: InvoiceProduct[];
  fromDate: string;
  toDate: string;
  creationDate: string;
  totalAmount: number;
  invoiceStatus: InvoiceStatusEntity;
  corporateCommercialRegistrationNumber: string;
  merchantCommercialRegistrationNumber: string;
  totalHoldingTaxAmount: number;
  totalVatAmount: number;
  rejected: boolean;
}

export interface InvoiceProduct {
  id: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  amount: number;
  vat: number;
  holdingTax: number;
  totalAmountIncludingVat: number;
}

export interface InvoiceStatusEntity {
  status: string;
}

export interface InvoiceSearch {
  siteId?: number;
  merchantId?: number;
  corporateId?: number;
  corporateLocaleName?: string;
  merchantLocaleName?: string;
  siteLocaleName?: string;
  corporateTaxId?: string;
  merchantTaxId?: string;
  fromDate?: number;
  toDate?: number;
  settled?: boolean;
}

export interface AdminInvoice extends SharedProps {
  serialNumber: string;
  merchantLocaleName: string;
  merchantEnName: string;
  siteLocaleName: string;
  siteEnName: string;
  corporateLocaleName: string;
  corporateEnName: string;
  corporateCommercialRegistrationNumber: string;
  merchantCommercialRegistrationNumber: string;
  merchantTaxId: string;
  corporateTaxId: string;
  corporateId: number;
  merchantId: number;
  siteId: number;
  invoicePackageId: number;
  siteAddress: string;
  settled: boolean;
  status: string;
  netAmount: number;
  totalAmount: number;
  totalVatAmount: number;
  totalHoldingTaxAmount: number;
  fromDate: string;
  toDate: string;
  invoiceProducts: InvoiceProduct[];
  rejections: Rejection[];
}

export interface Rejection {
  invoiceId: number;
  userId: number;
  userType: string;
  rejectionReason: string;
  rejectionDate: string;
}
