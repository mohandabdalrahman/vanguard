import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@shared/shared.module";
import {MerchantInfoComponent} from "./merchant-info/merchant-info.component";
import {MerchantReportsRoutingModule} from "./merchant-reports-routing.module";
import {SalesCityComponent} from "./sales-city/sales-city.component";
import {SalesCorporateComponent} from "./sales-corporate/sales-corporate.component";
import {SalesProductCategorySiteComponent} from "./sales-product-category-site/sales-product-category-site.component";
import {SalesProductCategoryComponent} from "./sales-product-category/sales-product-category.component";
import {SalesSalespersonComponent} from "./sales-salesperson/sales-salesperson.component";
import {SalesSitesComponent} from "./sales-sites/sales-sites.component";
import {SalespersonSalesCorporateComponent} from "./salesperson-sales-corporate/salesperson-sales-corporate.component";
import {SalespersonSalesProductComponent} from "./salesperson-sales-product/salesperson-sales-product.component";
import {SiteSalesCorporateComponent} from './site-sales-corporate/site-sales-corporate.component';
import {TotalSalesReportComponent} from './total-sales-report/total-sales-report.component';

@NgModule({
  declarations: [
    SalesSitesComponent,
    MerchantInfoComponent,
    SalesProductCategoryComponent,
    SalesCorporateComponent,
    SalesCityComponent,
    SalesProductCategorySiteComponent,
    SalespersonSalesCorporateComponent,
    SalespersonSalesProductComponent,
    SalesSalespersonComponent,
    SiteSalesCorporateComponent,
    TotalSalesReportComponent,
  ],
  imports: [
    SharedModule,
    MerchantReportsRoutingModule,
    TranslateModule.forChild({ extend: true }),

  ],
})
export class MerchantReportsModule {}
