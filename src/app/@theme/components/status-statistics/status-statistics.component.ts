import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-status-statistics',
  templateUrl: './status-statistics.component.html',
  styleUrls: ['./status-statistics.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class StatusStatisticsComponent implements OnInit {
  @Input() text: string;
  @Input() activeCount: number;
  @Input() inactiveCount: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}
