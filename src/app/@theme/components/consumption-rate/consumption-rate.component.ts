import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-consumption-rate',
  templateUrl: './consumption-rate.component.html',
  styleUrls: ['./consumption-rate.component.scss']
})
export class ConsumptionRateComponent implements OnInit {

  @Input() gridData
  @Input() vehicleDetails
  @Input() userDetails
  @Input() colData
  @Input() currentLang
  @Input() Goto: string
  @Input() title = "corporatePolicy.consumptionTitle"
  
  showUpdate: boolean = false

  ShowTable: Boolean = false
  ConsumptionRate: Boolean = true

  constructor() {

  }



  ngOnInit(): void {

  }



  ChangeView(event: string) {
    if (event == 'Grid') {
      this.ShowTable = false
    } else {
      this.ShowTable = true
    }
  }
}
