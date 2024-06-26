import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {unitCorporateTabs} from "../unit-corporate-tabs";

@Component({
  selector: 'app-unit-details',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class UnitDetailsComponent implements OnInit {
  tabs = [];

  constructor() { }

  ngOnInit(): void {
    this.tabs = unitCorporateTabs;
  }

}
