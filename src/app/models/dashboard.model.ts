export interface DashboardGroupByDto {
  id: number;
  localeName: string;
  enName: string;
  totalExpenses: number;
}

export interface CategoryDashboardDto {
  month: string;
  year: number;
  productCategoryId: number;
  productCategoryLocaleName: string;
  productCategoryEnName: string;
}

export interface ChartData {
  name: string;
  value: string;
}
