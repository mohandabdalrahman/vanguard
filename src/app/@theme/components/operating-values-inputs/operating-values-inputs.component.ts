import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {EmitService} from "@shared/services/emit.service";

@Component({
  selector: 'app-operating-values-inputs',
  templateUrl: './operating-values-inputs.component.html',
  styleUrls: ['./operating-values-inputs.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OperatingValuesInputsComponent implements OnInit {
  @Input() record: any;
  @Input() price: number;
  testRecord: any;

  constructor(private emitService: EmitService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (this.price) {
      this.calculateDailyOperatingValues(this.record, 'exchangeLimit' , false)
    }
  }

  calculateDailyOperatingValues(record: any, name: 'liters' | 'kiloMeters' | 'exchangeLimit', emitRecord = true) {
    const consumptionRate = record['consumptionDefaultRate'] || record['averageCalculatedConsumption']
    switch (name) {
      case 'liters':
        record['exchangeLimit'] = (+record['liters'] && this.price) ? +record['liters'] * this.price : null;
        record['kilometers'] = +record['liters'] ? (+record['liters'] * 100) / consumptionRate : null;
        break;
      case 'exchangeLimit':
        record['liters'] = (+record['exchangeLimit'] && this.price) ? +record['exchangeLimit'] / this.price : null;
        record['kilometers'] = +record['liters'] ? (+record['liters'] * 100) / consumptionRate : null;
        break;
      case 'kiloMeters':
        record['liters'] = +record['kilometers'] ? (+record['kilometers'] * consumptionRate) / 100 : null;
        record['exchangeLimit'] = (+record['liters'] && this.price) ? +record['liters'] * this.price : null;
        break;
    }
    this.testRecord = record;
    if (emitRecord) {
      setTimeout(() => {
        this.emitService.sendTableRecord(record)
      }, 1000)
    }
  }
}
