import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ListMerchantReportsComponent} from "@shared/list-merchant-reports/list-merchant-reports.component";
import {ListSalesComponent} from "@shared/list-sales/list-sales.component";
import {SalesCityComponent} from "./sales-city/sales-city.component";
import {SalesCorporateComponent} from "./sales-corporate/sales-corporate.component";
import {SalesProductCategorySiteComponent} from "./sales-product-category-site/sales-product-category-site.component";
import {SalesProductCategoryComponent} from "./sales-product-category/sales-product-category.component";
import {SalesSalespersonComponent} from "./sales-salesperson/sales-salesperson.component";
import {SalesSitesComponent} from "./sales-sites/sales-sites.component";
import {SalespersonSalesCorporateComponent} from "./salesperson-sales-corporate/salesperson-sales-corporate.component";
import {SalespersonSalesProductComponent} from "./salesperson-sales-product/salesperson-sales-product.component";
import {SiteSalesCorporateComponent} from "./site-sales-corporate/site-sales-corporate.component";
import {TotalSalesReportComponent} from "./total-sales-report/total-sales-report.component";
import { ReportName } from "../admin-reports/report-name.model";

const salesPerSiteTitle = "Transactions per site";
const salesPerSiteLocaleTitle = "العمليات بمنافذ البيع"

const salesPerProductCategoryTitle = "Transactions per product category";
const salesPerProductCategoryLocaleTitle = "العمليات بتصنيف المنتجات";

const salesPerCorporateTitle = "Transactions per Corporate";
const salesPerCorporateLocaleTitle = "العمليات بالشركات"

const salesPerCityTitle = "Sales per city";
const salesPerCityLocaleTitle = "المبيعات بالمدن";

const productCategorySalesPerSiteTitle = "Product category sales per site";
const productCategorySalesPerSiteLocaleTitle = "المبيعات  بتصنيف المنتجات لكل منافذ البيع"

const salesPersonSalesPerCompanyTitle = "Salesperson sales per corporate";
const salesPersonSalesPerCompanyLocaleTitle = "المبيعات بالبائعين لكل الشركات";

const salesPersonSalesPerProductTitle = "Salesperson sales per product";
const salesPersonSalesPerProductLocaleTitle = "المبيعات بالبائعين لكل المنتجات";

const salesPerSalesPersonTitle = "Transactions per sales-person";
const salesPerSalesPersonLocaleTitle = "العمليات بالبائعين";

const siteSalesPerCorporateTitle = "Sites sales per corporate";
const siteSalesPerCorporateLocaleTitle = "المبيعات بمنافذ البيع لكل الشركات";

const totalSalesTitle = "Total sales";
const totalSalesLocaleTitle = "إجمالي المبيعات بمنافذ البيع";

const saleCards = [
  {
    title: salesPerSiteTitle,
    localeTitle: salesPerSiteLocaleTitle,
    icon: "site.svg",
    link: "site",
  },
  {
    title: salesPerProductCategoryTitle,
    localeTitle: salesPerProductCategoryLocaleTitle,
    icon: "product-category.svg",
    link: "product-category",
  },
  {
    title: salesPerCorporateTitle,
    localeTitle: salesPerCorporateLocaleTitle,
    icon: "corporate.svg",
    link: "corporate",
  },
  {
    title: salesPerCityTitle,
    localeTitle: salesPerCityLocaleTitle,
    icon: "city.svg",
    link: "city",
  },
  {
    title: productCategorySalesPerSiteTitle,
    localeTitle: productCategorySalesPerSiteLocaleTitle,
    icon: "product-category.svg",
    link: "productCategory-sales-site",
  },
  {
    title: salesPersonSalesPerCompanyTitle,
    localeTitle: salesPersonSalesPerCompanyLocaleTitle,
    icon: "salesperson.svg",
    link: "salesperson-sales-corporate",
  },
  {
    title: salesPersonSalesPerProductTitle,
    localeTitle: salesPersonSalesPerProductLocaleTitle,
    icon: "product-category.svg",
    link: "salesperson-sales-product",
  },
  {
    title: salesPerSalesPersonTitle,
    localeTitle: salesPerSalesPersonLocaleTitle,
    icon: "salesperson.svg",
    link: "salesperson",
  },
  {
    title: siteSalesPerCorporateTitle,
    localeTitle: siteSalesPerCorporateLocaleTitle,
    icon: "corporate.svg",
    link: "site-sales-corporate",
  },
  {
    title: totalSalesTitle,
    localeTitle: totalSalesLocaleTitle,
    icon: "salesperson.svg",
    link: "total-sales",
  },
];
const links = [
  {
    title: salesPerSiteTitle,
    localeTitle: salesPerSiteLocaleTitle,
    path: "site" },
  {
    title: salesPerProductCategoryTitle,
    localeTitle: salesPerProductCategoryLocaleTitle,
    path: "product-category"
  },
  { title: salesPerCorporateTitle,
    localeTitle:salesPerCorporateLocaleTitle,
    path: "corporate"
  },
  { title: salesPerCityTitle,
    localeTitle:salesPerCityLocaleTitle,
    path: "city" },
  {
    title: productCategorySalesPerSiteTitle,
    localeTitle:productCategorySalesPerSiteLocaleTitle,
    path: "productCategory-sales-site",
  },
  {
    title: salesPersonSalesPerCompanyTitle,
    localeTitle: salesPersonSalesPerCompanyLocaleTitle,
    path: "salesperson-sales-corporate",
  },
  {
    title: salesPersonSalesPerProductTitle,
    localeTitle: salesPersonSalesPerProductLocaleTitle,
    path: "salesperson-sales-product",
  },
  {
    title: salesPerSalesPersonTitle,
    localeTitle: salesPerSalesPersonLocaleTitle,
    path: "salesperson",
  },
  {

    title: siteSalesPerCorporateTitle,
    localeTitle: siteSalesPerCorporateLocaleTitle,
    path: "site-sales-corporate",
  },
  {

    title: totalSalesTitle,
    localeTitle: totalSalesLocaleTitle,
    path: "total-sales",
  },
];

const routes: Routes = [
  {
    path: "",
    component: ListSalesComponent,
    data: { pageTitle: "merchant sales",saleCards },
  },
  {
    path: "list",
    component: ListMerchantReportsComponent,
    data: { pageTitle: "list merchant sales",links },
    children: [
      {
        path: "site",
        component: SalesSitesComponent,
        data: { pageTitle: "sales per site" ,
        reportName: ReportName.TRANSACTION_PER_SITE},
      },
      {
        path: "product-category",
        component: SalesProductCategoryComponent,
        data: { pageTitle: "sales per product category" ,
        reportName: ReportName.TRANSACTION_PER_PRODUCT_CATEGORY,},
      },
      {
        path: "corporate",
        component: SalesCorporateComponent,
        data: { pageTitle: "sales per corporate",
        reportName: ReportName.TRANSACTION_PER_CORPORATE, },
      },
      {
        path: "city",
        component: SalesCityComponent,
        data: { pageTitle: "sales per city",
        reportName: ReportName.SALES_PER_CITY, },
      },
      {
        path: "productCategory-sales-site",
        component: SalesProductCategorySiteComponent,
        data: { pageTitle: "Product category sales per site" ,
        reportName: ReportName.PRODUCT_CATEGORY_SALES_PER_SITE,},
      },
      {
        path: "salesperson-sales-corporate",
        component: SalespersonSalesCorporateComponent,
        data: { pageTitle: "salesperson sales per corporate",
        reportName: ReportName.SALES_PERSON_SALES_PER_CORPORATE,  },
      },
      {
        path: "site-sales-corporate",
        component: SiteSalesCorporateComponent,
        data: { pageTitle: "site sales per corporate",
        reportName: ReportName.SITES_SALES_PER_CORPORATE,  },
      },
      {
        path: "salesperson-sales-product",
        component: SalespersonSalesProductComponent,
        data: { pageTitle: "salesperson sales per product",
        reportName: ReportName.SALES_PERSON_SALES_PER_PRODUCT, },
      },
      {
        path: "salesperson",
        component: SalesSalespersonComponent,
        data: { pageTitle: "sales per salesperson",
        reportName: ReportName.TRANSACTION_SALES_PER_SALES_PERSON, },
      },
      {
        path: "total-sales",
        component: TotalSalesReportComponent,
        data: { pageTitle: "total sales" ,
        reportName: ReportName.TOTAL_SALES,},
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchantReportsRoutingModule {}
