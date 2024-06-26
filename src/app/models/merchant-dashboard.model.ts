import {CategoryDashboardDto, DashboardGroupByDto} from "@models/dashboard.model";

export interface MerchantDashboard {
  merchantId: number;
  numberOfSites: number;
  numberOfTransactions: number;
  numberOfUsers: number;
  numberOfProducts: number;
  invoicesSettledAmount: number;
  invoicesIssuedAmount: number
  invoicesPreIssuedAmount: number;
  totalSalesThisMonth: number;
  averageTransactionSizePerCategory: DashboardGroupByDto[];
  currentMonthTotalSalesPerCategory: DashboardGroupByDto[];
  currentMonthTotalSalesPerSite: DashboardGroupByDto[];
  totalSalesAcrossMonthsPerCategory: MerchantCategoryDashboardDto[];
  totalSalesAcrossMonthDaysPerCategory: MerchantCategoryDashboardDto[];
  totalSalesAcrossMonthsPerSite: MerchantSiteDashboardDto[];
  totalSalesAcrossMonthDaysPerSite: MerchantSiteDashboardDto[];
}


export interface MerchantCategoryDashboardDto extends CategoryDashboardDto {
  merchantId: number;
  day: number;
  totalSales: number;
}


export interface MerchantSiteDashboardDto{
  merchantId: number;
  day: number;
  month: string;
  year: number;
  siteId: number;
  siteLocaleName: string;
  siteEnName: string;
  totalExpenses: number;
}