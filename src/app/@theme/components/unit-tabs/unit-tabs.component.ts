import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-unit-tabs',
  templateUrl: './unit-tabs.component.html',
  styleUrls: ['./unit-tabs.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class UnitTabsComponent implements OnInit {
  @Input() tabs: { name?: string, path?: string, role?: string }[];

  constructor() { }

  ngOnInit(): void {
  }

}
