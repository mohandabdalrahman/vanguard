import {CategoryDashboardDto, DashboardGroupByDto} from "@models/dashboard.model";

export interface CorporateDashboard {
  totalSalesPerCategory: DashboardGroupByDto[];
  totalSalesPerCity: DashboardGroupByDto[];
  totalSalesAcrossMonthsPerCategory: TotalSalesAcrossMonthsPerCategory[];
  totalSalesAcrossMonthsPerZone: TotalSalesAcrossMonthsPerZone[];
  currentMonthTotalSalesPerCategory: DashboardGroupByDto[];
  topTenCardHolders: DashboardGroupByDto[];
  topTenVehicles: DashboardGroupByDto[];
  topTenHardware: DashboardGroupByDto[];
  topTenContainers: DashboardGroupByDto[];
  opiningBalanceThisMonth: number;
  availableBalanceThisMonth: number;
  paidAmountThisMonth: number;
}

export interface TotalSalesAcrossMonthsPerCategory extends CategoryDashboardDto {
  corporateId: number;
  totalExpenses: number;
}

export interface TotalSalesAcrossMonthsPerZone {
  corporateId: number;
  month: string;
  year: number;
  zoneId: number;
  zoneLocaleName: string;
  zoneEnName: string;
  totalExpenses: number;
}


