import {Component, Input, OnInit} from '@angular/core';
import {CurrentLangService} from "@shared/services/current-lang.service";
import {Policy} from "@models/policy.model";
import {ProductCategory} from "../../product/product-category.model";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";

@Component({
  selector: 'app-vehicle-daily-policy-header',
  templateUrl: './vehicle-daily-policy-header.component.html',
  styleUrls: ['./vehicle-daily-policy-header.component.scss']
})
export class VehicleDailyPolicyHeaderComponent implements OnInit {
  currentLang: string;
  @Input() headerData!: {
    selectedPolicy: Policy;
    productCategory: ProductCategory;
    corporateOu: CorporateOu;
    litersSum: number;
    kilometersSum: number;
    exchangeLimitSum: number;
  }

  constructor(private currentLangService: CurrentLangService) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
  }

}
