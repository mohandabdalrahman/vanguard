import {NgModule} from '@angular/core';
import {CorporateReportsRoutingModule} from './corporate-reports-routing.module';
import {SharedModule} from "@shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";
import {AssetTransactionsComponent} from "./asset-transactions/asset-transactions.component";
import {
  CardholderTransactionsPerMerchantComponent
} from './cardholder-transactions-merchant/cardholder-transactions-merchant.component';
import {CardholderTxnVehicleComponent} from './cardholder-txn-vehicle/cardholder-txn-vehicle.component';
import {CardholderTxnContainerComponent} from './cardholder-txn-container/cardholder-txn-container.component';
import {CardholderTxnHardwareComponent} from './cardholder-txn-hardware/cardholder-txn-hardware.component';
import {CardholderTxnCityComponent} from './cardholder-txn-city/cardholder-txn-city.component';
import {CardholderTxnSiteComponent} from './cardholder-txn-site/cardholder-txn-site.component';
import {CardholderTxnSalespersonComponent} from './cardholder-txn-salesperson/cardholder-txn-salesperson.component';
import {TxnAmountComponent} from './txn-amount/txn-amount.component';
import {CardholderTxnAmountComponent} from './cardholder-txn-amount/cardholder-txn-amount.component';
import {TopupComponent} from './topup/topup.component';
import {CardholderTransactionsComponent} from './cardholder-transactions/cardholder-transactions.component';
import { VehicleTotalExpensesComponent } from './vehicle-total-expenses/vehicle-total-expenses.component';
import { CardholderTotalExpensesComponent } from './cardholder-total-expenses/cardholder-total-expenses.component';
import { VehicleConsumptionDetailsComponent } from './vehicle-consumption-details/vehicle-consumption-details.component';
import { BankStatementComponent } from './bank-statement/bank-statement.component';


@NgModule({
  declarations: [
    AssetTransactionsComponent,
    CardholderTransactionsPerMerchantComponent,
    CardholderTxnVehicleComponent,
    CardholderTxnContainerComponent,
    CardholderTxnHardwareComponent,
    CardholderTxnCityComponent,
    CardholderTxnSiteComponent,
    CardholderTxnSalespersonComponent,
    TxnAmountComponent,
    CardholderTxnAmountComponent,
    TopupComponent,
    CardholderTransactionsComponent,
    VehicleTotalExpensesComponent,
    CardholderTotalExpensesComponent,
    VehicleConsumptionDetailsComponent,
    BankStatementComponent
  ],
  imports: [
    SharedModule,
    CorporateReportsRoutingModule,
    TranslateModule.forChild({extend: true}),
  ]
})
export class CorporateReportsModule {
}
