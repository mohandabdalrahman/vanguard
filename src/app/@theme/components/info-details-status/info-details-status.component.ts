import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-details-status',
  templateUrl: './info-details-status.component.html',
  styleUrls: ['./info-details-status.component.scss']
})
export class InfoDetailsStatusComponent implements OnInit {

  @Input() suspended:boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
