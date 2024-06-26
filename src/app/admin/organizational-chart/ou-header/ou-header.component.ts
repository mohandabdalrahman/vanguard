import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-ou-header',
  templateUrl: './ou-header.component.html',
  styleUrls: ['./ou-header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OuHeaderComponent implements OnInit {
  @Input() mainUnitsNum: number;
  @Input() branchUnitsNum: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}
