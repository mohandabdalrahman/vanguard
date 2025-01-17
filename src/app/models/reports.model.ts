// export interface MerchantSale {
//   totalNumberOfTransactions: number;
//   totalSales: number;
//   salesList: Sale[];
//   totalSalesIncludingVat: number;
//   totalProductsVat: number;
// }
export interface SaleSearchObj {
  fromDate?: number;
  toDate?: number;
  corporateIds?: number[];
  productCategories?: number[];
  sites?: number[];
  cities?: number[];
  salesPersonIds?: number[];
  assetTypes?: string[];
  transactionStatus?: string;
}

export interface TransactionsReportsSearchObj {
  fromDate?: number;
  toDate?: number;
  cardHolderIds?: number[];
  corporateUserIds?: number[];
  assetIds?: number[];
  assetTagIds?: number[];
  vehicleTypeIds?: number[];
  merchantIds?: number[];
  productIds?: number[];
  productCategoryIds?: number[];
  siteIds?: number[];
  cityIds?: number[];
  zoneIds?: number[];
  salesPersonIds?: number[];
  corporateIds?: number[];
  assetTypes?: string[];
  transactionStatus?: string;
  ouIds?: number[];
}

// Generated by https://quicktype.io

export interface MerchantSale {
  totalNumberOfTransactions: number;
  totalSales: number;
  totalProductsVat: number;
  totalSalesIncludingVat: number;
  salesList: Sale[];
  sales: MerchantSales;
}

export interface MerchantSales {
  totalElements: number;
  totalPages: number;
  number: number;
  sort: Sort;
  size: number;
  content: Sale[];
  pageable: Pageable;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  paged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Lookup {
  id: number,
  localeName: string,
  enName: string
}


export interface Sale {
  uuid: number;
  transactionItemId: number;
  transactionUuid: string;
  transactionCreationDate: Date;
  creationDate: Date;
  transactionStatus: string;
  transactionItemAmount: number;
  quantity: number;
  policyId: number;
  productCategoryId: number;
  productCategoryLocaleName: string;
  productCategoryEnName: string;
  productId: number;
  productLocaleName: string;
  productEnName: string;
  vatAmount: number;
  netAmount: number;
  grossAmount: number;
  grossAmountIncludingVat: number;
  siteId: number;
  siteLocaleName: string;
  siteEnName: string;
  zoneId: number;
  zoneLocaleName: string;
  zoneEnName: string;
  cityId: number;
  cityLocaleName: string;
  cityEnName: string;
  salesPersonId: number;
  salesPersonLocaleName: string;
  salesPersonEnName: string;
  cardHolderId: number;
  cardHolderLocaleName: string;
  cardHolderEnName: string;
  corporateUserId: string;
  assetId: number;
  assetLocaleName: string;
  assetEnName: string;
  assetType: string;
  assetTagId: number;
  assetNfcSerialNumber: string;
  assetNfcId: number;
  vehicleTypeId: number;
  vehiclePlateNumber: string;
  vehicleTypeLocaleName: string;
  vehicleTypeEnName: string;
  merchantId: number;
  merchantLocaleName: string;
  merchantEnName: string;
  corporateId: number;
  corporateLocaleName: string;
  corporateEnName: string;
  currencyId: number;
  currencyCode: string;
  currentMileage: number;
  otuId: number;
  otuLocaleName: string;
  otuEnName: string;
  assetSuspended: boolean;
  cardHolderNfcSerialNumber: string;
  transactionItemReportDtoList: TransactionItemReportDtoList[];
  ouEnName: string,
  ouLocaleName: string,
}

export interface TransactionItemReportDtoList {
  transactionItemId: number;
  transactionItemAmount: number;
  quantity: number;
  currentMileage: number;
  policyId: number;
  policyLocaleName: string;
  policyEnName: string;
  productCategoryId: number;
  productCategoryLocaleName: string;
  productCategoryEnName: string;
  productId: number;
  productLocaleName: string;
  productEnName: string;
  vatAmount: number;
  netAmount: number;
  assetId: number;
  assetLocaleName: string;
  assetEnName: string;
  assetType: string;
  assetTagId: number;
  assetNfcSerialNumber: string;
  assetNfcId: number;
  vehicleTypeId: number;
  vehiclePlateNumber: string;
  vehicleTypeLocaleName: string;
  vehicleTypeEnName: string;
  assetSuspended: boolean;
}

export interface TotalSales {
  totalNumberOfTransactions: number;
  totalSales: number;
  totalProductsVat: number;
  totalSalesIncludingVat: number;
  totalQuantity: number;
  totalsGroups: TotalsGroup[];
}

export interface TransactionsReportDto {
  totalNumberOfTransactions?: number;
  totalNetAmounts?: number;
  totalVatAmounts?: number;
  totalAmountsIncludingVat?: number;
  totalSalesIncludingVat: number;
  totalCommissionAmounts?: number;
  totalAmountsIncludingCommission?: number;
  transactionsList?: TransactionsList[];
  transactionItemList?: TransactionsList[];
  transactionsPage?: MerchantSales;
  transactionItemPage?: MerchantSales;
  totalAmounts?: number;
}

export interface TransactionsList {
  uuid?: string;
  vehiclePlateNumber?: string;
  vehicleCode?: string;
  vehicleTypeId?: number;
  vehicleTypeLocaleName?: string;
  vehicleTypeEnName?: string;
  currentMileage?: number;
  cardHolderId?: number;
  cardHolderLocaleName?: string;
  cardHolderEnName?: string;
  salesPersonId?: number;
  salesPersonLocaleName?: string;
  salesPersonEnName?: string;
  siteId?: number;
  siteLocaleName?: string;
  siteEnName?: string;
  cityId?: number;
  cityLocaleName?: string;
  cityEnName?: string;
  merchantId?: number;
  merchantLocaleName?: string;
  merchantEnName?: string;
  netAmount?: number;
  vatAmount?: number;
  grossAmountIncludingVat?: number;
  commissionAmount?: number;
  grossAmountIncludingCommission?: number;
  creationDate?: string;
  ouId?: number;
  ouLocaleName?: string;
  ouEnName?: string;
}

export interface TotalsGroup {
  groupByLocale: string;
  groupByEn: string;
  totalNumberOfTransactionItems: number;
  totalNumberOfTransactions: number;
  totalSales: number;
  totalProductsVat: number;
  totalSalesIncludingVat: number;
  totalNumberOfCardHolders: number;
  totalNumberOfVehicles: number;
  totalNumberOfHardware: number;
  totalNumberOfContainers: number;
  totalNumberOfProducts: number;
  totalQuantity: number;
}


export enum SalesGroup {
  PRODUCT_CATEGORY_ID = 'PRODUCT_CATEGORY_ID',
  PRODUCT_ID = 'PRODUCT_ID',
  SITE_ID = 'SITE_ID',
  ZONE_ID = 'ZONE_ID',
  CITY_ID = 'CITY_ID',
  ASSET_ID = 'ASSET_ID',
  MERCHANT_ID = 'MERCHANT_ID',
  CORPORATE_ID = 'CORPORATE_ID',
  SALES_PERSON_ID = 'SALES_PERSON_ID'
}

export enum LookupType {
  MERCHANT = 'MERCHANT',
  SALESPERSON = 'SALESPERSON',
  SITE = 'SITE',
  PRODUCT = 'PRODUCT',
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  CITY = 'CITY'
}


export interface AdminSearchObj {
  fromDate?: number;
  toDate?: number;
  fromMonth?: string;
  toMonth?: string;
  corporateIds?: number[];
  corporateId?: number;
  productCategoryIds?: number[];
  vehicleTypeIds?: number[];
  commissionRate?: number;
  plateNumber?: number;
  assetIds?: number[];
  assetTypes?: string[];
  ouIds?: number[];
  assetTagIds?: number[];
}


export interface ProductCategoryPolicyBudget {
  corporateLocaleName: string;
  corporateEnName: string;
  productCategoryLocaleName: string;
  productCategoryEnName: string;
  policyLocaleName: string;
  policyEnName: string;
  policyCycleType: string;
  numberOfCycles: number;
  numberOfAssignedCardholders: number;
  numberOfAssignedVehicles: number;
  allocatedBudget: number;
}

export interface CorporateDetailedSales {
  corporateId: number;
  corporateLocaleName: string;
  corporateEnName: string;
  totalNumberOfTransactions: number;
  totalNumberOfMerchants: number;
  totalNumberOfUsedProductCategories: number;
  totalNumberOfVisitedSites: number;
  totalNumberOfVisitedCities: number;
}


export interface VehicleReport {
  assetId: number;
  month: number;
  corporateId: number;
  vehicleTypeId: number;
  vehicleTypeEnName: string;
  vehicleTypeLocaleName: string;
  plateNumber: string;
  totalMileage: number;
  lastReadingMileage: number;
  fuelType: string;
  averageNumberOfTransactions: number;
  totalNumberOfTransactions: number;
  totalTransactionsAmount: number;
  totalFuelConsumption: number;
  totalMaintenanceConsumption: number;
  totalOilChangeConsumption: number;
  averageNumberOfCities: number;
  averageNumberOfSites: number;
  averageCalculatedConsumption: number;
  averageFuelTransactionAmount: number;
  averageFuelConsumptionRate: number
  tankSize: number;
  ouLocaleName: string;
  ouEnName: string;
  consumptionDefaultRate: number;
  totalNumberOfFuelLiters: number;
  totalNumberOfAlerts: number;
  numberOfFuelLiters: number;
  vehicleCode: string;
  fuelOverConsumptionLiters: number;
  brand: string;
  periodFirstReadingMileage: number;
  periodLastReadingMileage: number;
  assetTagId?: number;
}


export interface ProductCategoryDetailedSales {
  productCategoryLocaleName: string;
  productCategoryEnName: string;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  totalNumberOfTransactions: number;
  totalNumberOfMerchants: number;
  totalNumberOfSites: number;
  totalNumberOfVehicles: number;
}

export interface CorporateCommission {
  corporateId: number;
  corporateLocaleName: string;
  corporateEnName: string;
  numberOfTopUps: number;
  totalAmountOfTopUps: number;
  totalNumberOfTransactions: number;
  totalAmountOfTransactions: number;
  currentCommissionRate: number;
  totalCommissionAmount: number;
  averageCommissionAmount: number;
}

export interface ManagementSearchObj {
  fromDate?: number;
  toDate?: number;
}

export interface ManagementReport {
  fromDate?: number;
  toDate?: number;
  transactionsDate: string
  corporateId: number;
  corporateLocaleName: string;
  corporateEnName: string;
  merchantId: number;
  merchantLocaleName: string;
  merchantEnName: string;
  siteId: number,
  siteLocaleName: string,
  siteEnName: string,
  productId: number;
  productLocaleName: string;
  productEnName: string;
  productCategoryId: number;
  productCategoryLocaleName: string;
  productCategoryEnName: string;
  transactionsAmount: number;
  totalQuantity: number;
  transactionsCommissionAmount: number;

}

export interface ManagementReportDto {
  managementReportList?: ManagementReport;
  managementReportPage?: ManagementReportPage;
}

export interface ManagementReportPage {
  totalPages: number;
  totalElements: number;
  number: number;
  sort: Sort;
  size: number;
  content: ManagementReport[];
  numberOfElements: number;
  pageable: Pageable;
  first: true;
  last: true;
  empty: true;
}

export interface CorporateBankStatement {
  id: number;
  corporateId: number;
  trxDescription: string;
  transactionCreationDate: string;
  transactionType: string;
  transactionAmount?: number;
  corporateBalance: number;
  transactionAmountDebit?: number;
  transactionAmountCredit?: number;
}