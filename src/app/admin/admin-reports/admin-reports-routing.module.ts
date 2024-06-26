import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListSalesComponent } from "@shared/list-sales/list-sales.component";
import { ListMerchantReportsComponent } from "@shared/list-merchant-reports/list-merchant-reports.component";
import { SalesGroup } from "@models/reports.model";
import { TotalTxnAmountComponent } from "@shared/total-txn-amount/total-txn-amount.component";
import { CorporateSalesComponent } from "./corporate-sales/corporate-sales.component";
import { ReportName } from "./report-name.model";

const corporatesConsumptionPerProductCategory =
  "Corporates Consumption Per Product Category";
const corporatesConsumptionPerProductCategoryLocale =
  "استهلاك الشركات حسب فئة المنتج";
const corporateConsumptionPerMerchant = "Corporate Consumption Per Merchant";
const corporateConsumptionPerMerchantLocale = "استهلاك الشركات لكل تاجر";
const corporateSales = "detailed corporate sales";
const corporateSalesLocale = "تفاصيل مبيعات الشركات";
const corporateConsumptionPerCity = "corporate consumption per city";
const corporateConsumptionPerCityLocale = "استهلاك الشركات لكل مدينة";
const productCategoryBudgetByPolicy = "product category budget by policy";
const productCategoryBudgetByPolicyLocale = "ميزانية فئة المنتج حسب السياسة";
const productCategoryConsumptionDetails =
  "product category consumption details";
const productCategoryConsumptionDetailsLocale = "تفاصيل استهلاك فئة المنتج";
const corporateVehicleDetails = "corporate vehicle details";
const corporateVehicleDetailsLocale = "تفاصيل مركبة الشركة";
const commissionByCorporate = "commission by corporate";
const commissionByCorporateLocale = "عمولة من قبل الشركة";
const corporateVehicleConsumption = "corporate vehicle consumption";
const corporateVehicleConsumptionLocale = "استهلاك سيارات الشركات";
const managementReport = "Management Report";
const managementReportLocale = "تقرير الادارة";

// Paths
const corporatesConsumeProductCategoryPath =
  "corporate-consume-productCategory";
const corporatesConsumeMerchantPath = "corporate-consume-merchant";
const corporateSalesPath = "corporate-sales";
const corporateConsumeCityPath = "corporate-consume-city";
const productCategoryBudgetPolicyPath = "productCategory-budget-policy";
const productCategoryConsumeDetailsPath = "productCategory-consume-details";
const corporateVehiclePath = "vehicle-main-info";
const commissionCorporatePath = "commission-corporate";
const corporateVehicleConsumePath = "corporate-vehicle-consumption";
const managementReportPath = "management-report";

const saleCards = [
  {
    title: corporatesConsumptionPerProductCategory,
    localeTitle: corporatesConsumptionPerProductCategoryLocale,
    icon: "corporate.svg",
    link: corporatesConsumeProductCategoryPath,
  },
  {
    title: corporateConsumptionPerMerchant,
    localeTitle: corporateConsumptionPerMerchantLocale,
    icon: "corporate.svg",
    link: corporatesConsumeMerchantPath,
  },
  {
    title: corporateSales,
    localeTitle: corporateSalesLocale,
    icon: "corporate.svg",
    link: corporateSalesPath,
  },
  {
    title: corporateConsumptionPerCity,
    localeTitle: corporateConsumptionPerCityLocale,
    icon: "corporate.svg",
    link: corporateConsumeCityPath,
  },
  {
    title: productCategoryBudgetByPolicy,
    localeTitle: productCategoryBudgetByPolicyLocale,
    icon: "product-category.svg",
    link: productCategoryBudgetPolicyPath,
  },
  {
    title: productCategoryConsumptionDetails,
    localeTitle: productCategoryConsumptionDetailsLocale,
    icon: "product-category.svg",
    link: productCategoryConsumeDetailsPath,
  },
  {
    title: corporateVehicleDetails,
    localeTitle: corporateVehicleDetailsLocale,
    icon: "corporate.svg",
    link: corporateVehiclePath,
  },
  {
    title: commissionByCorporate,
    localeTitle: commissionByCorporateLocale,
    icon: "corporate.svg",
    link: commissionCorporatePath,
  },
  {
    title: corporateVehicleConsumption,
    localeTitle: corporateVehicleConsumptionLocale,
    icon: "corporate.svg",
    link: corporateVehicleConsumePath,
  },
  {
    title: managementReport,
    localeTitle: managementReportLocale,
    icon: "product-category.svg",
    link: managementReportPath,
    userType: "admin",
  },
];

const links = [
  {
    title: corporatesConsumptionPerProductCategory,
    localeTitle: corporatesConsumptionPerProductCategoryLocale,
    path: corporatesConsumeProductCategoryPath,
  },
  {
    title: corporateConsumptionPerMerchant,
    localeTitle: corporateConsumptionPerMerchantLocale,
    path: corporatesConsumeMerchantPath,
  },
  {
    title: corporateSales,
    localeTitle: corporateSalesLocale,
    path: corporateSalesPath,
  },
  {
    title: corporateConsumptionPerCity,
    localeTitle: corporateConsumptionPerCityLocale,
    path: corporateConsumeCityPath,
  },
  {
    title: productCategoryBudgetByPolicy,
    localeTitle: productCategoryBudgetByPolicyLocale,
    path: productCategoryBudgetPolicyPath,
  },
  {
    title: productCategoryConsumptionDetails,
    localeTitle: productCategoryConsumptionDetailsLocale,
    path: productCategoryConsumeDetailsPath,
  },
  {
    title: corporateVehicleDetails,
    localeTitle: corporateVehicleDetailsLocale,
    path: corporateVehiclePath,
  },
  {
    title: commissionByCorporate,
    localeTitle: commissionByCorporateLocale,
    path: commissionCorporatePath,
  },
  {
    title: corporateVehicleConsumption,
    localeTitle: corporateVehicleConsumptionLocale,
    path: corporateVehicleConsumePath,
  },
  {
    title: managementReport,
    localeTitle: managementReportLocale,
    path: managementReportPath,
  },
];

const routes: Routes = [
  {
    path: "",
    component: ListSalesComponent,
    data: { pageTitle: "Admin sales", saleCards },
  },
  {
    path: "list",
    component: ListMerchantReportsComponent,
    data: { pageTitle: "List admin sales", links },
    children: [
      {
        path: corporatesConsumeProductCategoryPath,
        component: TotalTxnAmountComponent,
        data: {
          pageTitle: "Corporate consume per product category",
          salesGroup: SalesGroup.CORPORATE_ID,
          reportName: ReportName.CORPORATE_CONSUMPTION_PER_PRODUCT_CATEGORY,
          removeAdditionalTotals: true,
        },
      },
      {
        path: corporatesConsumeMerchantPath,
        component: TotalTxnAmountComponent,
        data: {
          pageTitle: "Corporate consume per merchant",
          salesGroup: SalesGroup.MERCHANT_ID,
          reportName: ReportName.CORPORATE_CONSUMPTION_PER_MERCHANT,
          removeAdditionalTotals: true,
        },
      },
      {
        path: corporateConsumeCityPath,
        component: TotalTxnAmountComponent,
        data: {
          pageTitle: "Corporate consume per city",
          salesGroup: SalesGroup.CITY_ID,
          reportName: ReportName.CORPORATE_CONSUMPTION_PER_CITY,
          removeAdditionalTotals: true,
        },
      },
      {
        path: corporateVehiclePath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Corporate vehicle details",
          reportName: ReportName.CORPORATE_VEHICLE_DETAILS,
        },
      },
      {
        path: corporateVehicleConsumePath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Corporate vehicle consumption",
          reportName: ReportName.CORPORATE_VEHICLE_CONSUMPTION,
        },
      },
      {
        path: commissionCorporatePath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Commission by corporate",
          reportName: ReportName.COMMISSION_BY_CORPORATE,
        },
      },
      {
        path: productCategoryConsumeDetailsPath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Product category consumption",
          reportName: ReportName.PRODUCT_CATEGORY_CONSUMPTION,
        },
      },
      {
        path: productCategoryBudgetPolicyPath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Product category budget policy",
          reportName: ReportName.PRODUCT_CATEGORY_BUDGET_POLICY,
        },
      },
      {
        path: corporateSalesPath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Corporate sales",
          reportName: ReportName.CORPORATE_SALES,
        },
      },
      {
        path: managementReportPath,
        component: CorporateSalesComponent,
        data: {
          pageTitle: "Management Report",
          reportName: ReportName.MANAGEMENT_REPORT,
          removeAdditionalTotals: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminReportsRoutingModule {}
