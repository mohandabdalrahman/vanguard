import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class TooltipComponent implements OnInit {
  @Input() infoText: string;
  @Input() iconName = 'info-outline';
  @Input() mode: 'warning' | 'error';
  @Input() color: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
