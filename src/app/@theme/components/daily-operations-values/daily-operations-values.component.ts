import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-daily-operations-values',
  templateUrl: './daily-operations-values.component.html',
  styleUrls: ['./daily-operations-values.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DailyOperationsValuesComponent implements OnInit {
  @Input() record: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  isProductCategoryIdSame(record: any): boolean {
    return record['assetPolicies'].some(policy => policy['productCategoryId'] == record['assignedPolicyProductCategoryId'])
  }
}
