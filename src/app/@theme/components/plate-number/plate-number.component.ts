import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-plate-number',
  templateUrl: './plate-number.component.html',
  styleUrls: ['./plate-number.component.scss']
})
export class PlateNumberComponent implements OnInit {

  @Input() plateNumber:string
  constructor() { }

  ngOnInit(): void {
  }

}
