import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListSalesComponent} from "@shared/list-sales/list-sales.component";
import {ListMerchantReportsComponent} from "@shared/list-merchant-reports/list-merchant-reports.component";
import {AssetTransactionsComponent} from "./asset-transactions/asset-transactions.component";
import {AssetType} from "@models/asset-type";
import {CardholderTxnSalespersonComponent} from "./cardholder-txn-salesperson/cardholder-txn-salesperson.component";
import {TotalTxnAmountComponent} from "@shared/total-txn-amount/total-txn-amount.component";
import {SalesGroup} from "@models/reports.model";
import {CardholderTxnAmountComponent} from "./cardholder-txn-amount/cardholder-txn-amount.component";
import {CardholderTransactionsComponent} from "./cardholder-transactions/cardholder-transactions.component";
import {ReportName} from '../admin-reports/report-name.model';
import {VehicleTotalExpensesComponent} from './vehicle-total-expenses/vehicle-total-expenses.component';
import {CardholderTotalExpensesComponent} from './cardholder-total-expenses/cardholder-total-expenses.component';
import {TopupComponent} from './topup/topup.component';
import {VehicleConsumptionDetailsComponent} from './vehicle-consumption-details/vehicle-consumption-details.component';
import {BankStatementComponent} from "./bank-statement/bank-statement.component";

const vehicleTransactions = "Vehicle's detailed expenses";
const vehicleTransactionslocaleTitle = "تفاصيل مصروفات المركبات لكل معامله";

const CARDHOLDER_EXPENSES_PER_SALES_PERSON = "Cardholder Expenses per sales person";
const CARDHOLDER_EXPENSES_PER_SALES_PERSON_LOCAL_TITLE = "مصروفات حاملي الكروت لكل بائع"

const TOTAL_EXPENSES_PER_MERCHANT = "Total expenses per merchant";
const TOTAL_EXPENSES_PER_MERCHANT_LOCAL_TITLE = "اجمالى المصروفات لكل تاجر";

const CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY = "Cardholder Expenses Per Product Category";
const CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY_LOCAL_TITLE = "مجموع مصروفات حاملي الكروت لكل تصنيف منتج";

const TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT = "Total Cardholder Expenses Per Product";
const TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT_LOCAL_TITLE = "اجمالى المصروفات لحاملى الكروت لكل منتج";

const TOP_UP = "Top Up Details";
const TOP_UP_LOCAL_TITLE = "تفاصيل تعبئة الرصيد"

const DETAILED_EXPENSES = "Detailed Expenses";
const DETAILED_EXPENSES_LOCAL_TITLE = "تفاصيل المصروفات";

const VEHICLE_TOTAL_EXPENSES = "Vehicle Total Expenses";
const VEHICLE_TOTAL_EXPENSES_Local_Title = "اجمالى مصروفات المركبات";

const CARDHOLDER_DETAILED_EXPENSES = "Cardholder Detailed Expenses Per Transaction";
const CARDHOLDER_DETAILED_EXPENSES_LOCAL_TITLE = "تفاصيل مصروفات حامل الكارت لكل معامله";

const CARDHOLDER_TOTAL_EXPENSES = "Cardholder Total Expenses";
const CARDHOLDER_TOTAL_EXPENSES_LOCAL_TITLE = "اجمالى المصروفات لحامل الكارت";

const VEHICLE_CONSUMPTION_DETAILS = "Vehicle Consumption Details";
const VEHICLE_CONSUMPTION_DETAILS_LOCAL_TITLE = "تفاصيل استهلاك المركبات";

const BANK_STATEMENT = "Account Statement";
const BANK_STATEMENT_LOCAL_TITLE = "كشف حساب";

const saleCards = [
  {
    title: vehicleTransactions,
    localeTitle: vehicleTransactionslocaleTitle,
    icon: "site.svg",
    link: "Vehicle-detailed-expenses",
  },
  // {
  //   title: hardwareTransactions,
  //   localeTitle: hardwareTransactionslocaleTitle,
  //   icon: "site.svg",
  //   link: "hardware",
  // },
  // {
  //   title: containerTransactions,
  //   localeTitle: containerTransactionslocaleTitle,
  //   icon: "site.svg",
  //   link: "container",
  // },
  {
    title: DETAILED_EXPENSES,
    localeTitle: DETAILED_EXPENSES_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "detailed-expenses",
  },
  {
    title: CARDHOLDER_EXPENSES_PER_SALES_PERSON,
    localeTitle: CARDHOLDER_EXPENSES_PER_SALES_PERSON_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "cardholder-expenses-per-salesperson",
  },
  {
    title: TOTAL_EXPENSES_PER_MERCHANT,
    localeTitle: TOTAL_EXPENSES_PER_MERCHANT_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "total-expenses-per-merchant",
  },
  {
    title: CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY,
    localeTitle: CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "cardholder-expenses-per-product-category",
  },
  {
    title: TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT,
    localeTitle: TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "total-cardholder-expenses-per-product",
  },
  {
    title: TOP_UP,
    localeTitle: TOP_UP_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "top-up",
  },
  {
    title: VEHICLE_TOTAL_EXPENSES,
    localeTitle: VEHICLE_TOTAL_EXPENSES_Local_Title,
    icon: "salesperson.svg",
    link: "Vehicle-Total-Expenses",
  },
  {
    title: CARDHOLDER_DETAILED_EXPENSES,
    localeTitle: CARDHOLDER_DETAILED_EXPENSES_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "cardholder-detailed-expenses-per-transaction",
  },
  {
    title: CARDHOLDER_TOTAL_EXPENSES,
    localeTitle: CARDHOLDER_TOTAL_EXPENSES_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "Cardholder-Total-Expenses",
  },
  {
    title: VEHICLE_CONSUMPTION_DETAILS,
    localeTitle: VEHICLE_CONSUMPTION_DETAILS_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "Vehicle-consumption-details",
  },
  {
    title: BANK_STATEMENT,
    localeTitle: BANK_STATEMENT_LOCAL_TITLE,
    icon: "salesperson.svg",
    link: "bank-statement",
  },
]

const links = [
  {title: vehicleTransactions, localeTitle: vehicleTransactionslocaleTitle, path: "Vehicle-detailed-expenses"},
  // {title: hardwareTransactions, localeTitle: hardwareTransactionslocaleTitle, path: "hardware"},
  // {title: containerTransactions, localeTitle: containerTransactionslocaleTitle, path: "container"},
  {
    title: DETAILED_EXPENSES,
    localeTitle: DETAILED_EXPENSES_LOCAL_TITLE,
    path: "detailed-expenses"
  },
  {
    title: CARDHOLDER_EXPENSES_PER_SALES_PERSON,
    localeTitle: CARDHOLDER_EXPENSES_PER_SALES_PERSON_LOCAL_TITLE,
    path: "cardholder-expenses-per-salesperson"
  },
  {
    title: TOTAL_EXPENSES_PER_MERCHANT,
    localeTitle: TOTAL_EXPENSES_PER_MERCHANT_LOCAL_TITLE,
    path: "total-expenses-per-merchant"
  },
  {
    title: CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY,
    localeTitle: CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY_LOCAL_TITLE,
    path: "cardholder-expenses-per-product-category"
  },
  {
    title: TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT,
    localeTitle: TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT_LOCAL_TITLE,
    path: "total-cardholder-expenses-per-product"
  },
  {
    title: TOP_UP,
    localeTitle: TOP_UP_LOCAL_TITLE,
    path: "top-up"
  },
  {
    title: VEHICLE_TOTAL_EXPENSES,
    localeTitle: VEHICLE_TOTAL_EXPENSES_Local_Title,
    path: "Vehicle-Total-Expenses",
  },
  {
    title: CARDHOLDER_DETAILED_EXPENSES,
    localeTitle: CARDHOLDER_DETAILED_EXPENSES_LOCAL_TITLE,
    path: "cardholder-detailed-expenses-per-transaction",
  },
  {
    title: CARDHOLDER_TOTAL_EXPENSES,
    localeTitle: CARDHOLDER_TOTAL_EXPENSES_LOCAL_TITLE,
    path: "Cardholder-Total-Expenses",
  },
  {
    title: VEHICLE_CONSUMPTION_DETAILS,
    localeTitle: VEHICLE_CONSUMPTION_DETAILS_LOCAL_TITLE,
    path: "Vehicle-consumption-details",
  },
  {
    title: BANK_STATEMENT,
    localeTitle: BANK_STATEMENT_LOCAL_TITLE,
    path: "bank-statement",
  },
]

const routes: Routes = [
  {
    path: "",
    component: ListSalesComponent,
    data: {pageTitle: "corporate sales", saleCards},
  },
  {
    path: "list",
    component: ListMerchantReportsComponent,
    data: {pageTitle: "list corporate sales", links},
    children: [
      {
        path: "Vehicle-detailed-expenses",
        component: AssetTransactionsComponent,
        data: {
          pageTitle: "Vehicle's Detailed Expenses",
          assetType: AssetType.Vehicle,
          reportName: ReportName.VEHICLE_DETAILED_EXPENSES,
        },
      },
      // {
      //   path: "hardware",
      //   component: AssetTransactionsComponent,
      //   data: {pageTitle: "hardware Transactions", assetType: AssetType.Hardware},
      // },
      // {
      //   path: "container",
      //   component: AssetTransactionsComponent,
      //   data: {pageTitle: "container Transactions", assetType: AssetType.Container},
      // },
      {
        path: "detailed-expenses",
        component: CardholderTransactionsComponent,
        data: {
          pageTitle: "Detailed Expenses",
          reportName: ReportName.DETAILED_EXPENSES
        },
      },
      {
        path: "cardholder-expenses-per-salesperson",
        component: CardholderTxnSalespersonComponent,
        data: {
          pageTitle: "Cardholder expenses per salesperson",
          assetType: AssetType.User,
          reportName: ReportName.CARDHOLDER_EXPENSES_PER_SALES_PERSON
        },
      },
      {
        path: "total-expenses-per-merchant",
        component: TotalTxnAmountComponent,
        data: {
          pageTitle: "Transactions amount per merchant", salesGroup: SalesGroup.MERCHANT_ID,
          reportName: ReportName.TOTAL_EXPENSES_PER_MERCHNAT
        },
      },
      {
        path: "cardholder-expenses-per-product-category",
        component: CardholderTxnAmountComponent,
        data: {
          pageTitle: "Cardholder expenses per product category",
          salesGroup: SalesGroup.PRODUCT_CATEGORY_ID,
          reportName: ReportName.CARDHOLDER_EXPENSES_PER_PRODUCT_CATEGORY
        },
      },
      {
        path: "total-cardholder-expenses-per-product",
        component: CardholderTxnAmountComponent,
        data: {
          pageTitle: "Total cardholder expenses per product",
          salesGroup: SalesGroup.PRODUCT_ID,
          reportName: ReportName.TOTAL_CARDHOLDER_EXPENSES_PER_PRODUCT
        },
      },
      {
        path: "top-up",
        component: TopupComponent,
        data: {
          pageTitle: "top up details",
          reportName: ReportName.TOP_UP_DETAILS
        },
      },
      {
        path: "Vehicle-Total-Expenses",
        component: VehicleTotalExpensesComponent,
        data: {
          pageTitle: "Vehicle Total Expenses",
          assetType: AssetType.Vehicle,
          reportName: ReportName.VEHICLE_TOTAL_EXPENSES
        },
      },
      {
        path: "cardholder-detailed-expenses-per-transaction",
        component: AssetTransactionsComponent,
        data: {
          pageTitle: "Cardholder Detailed Expenses Per Transaction",
          assetType: AssetType.User,
          reportName: ReportName.CARDHOLDER_DETAILED_EXPENSES,
        },
      },
      {
        path: "Cardholder-Total-Expenses",
        component: CardholderTotalExpensesComponent,
        data: {
          pageTitle: "Cardholder Total Expenses",
          assetType: AssetType.User,
          reportName: ReportName.CARDHOLDER_TOTAL_EXPENSES
        },
      },
      {
        path: "Vehicle-consumption-details",
        component: VehicleConsumptionDetailsComponent,
        data: {
          pageTitle: "Vehicle Consumption Details",
          assetType: AssetType.Vehicle,
          reportName: ReportName.VEHICLE_CONSUMPTION_DETAILS
        },
      },
      {
        path: "bank-statement",
        component: BankStatementComponent,
        data: {
          pageTitle: "Bank Statement",
        }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateReportsRoutingModule {
}
