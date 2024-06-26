import {Component, Input, OnInit} from '@angular/core';
import {ChartData} from "@models/dashboard.model";

@Component({
  selector: 'app-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.scss']
})
export class DashboardTableComponent implements OnInit {

  @Input() chartData: ChartData[];
  @Input() isAsset = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
