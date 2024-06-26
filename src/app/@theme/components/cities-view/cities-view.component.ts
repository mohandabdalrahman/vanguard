import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cities-view',
  templateUrl: './cities-view.component.html',
  styleUrls: ['./cities-view.component.scss']
})
export class CitiesViewComponent implements OnInit {
  @Input() Cities
  @Input() zones
  constructor() { }



  ngOnInit(): void {
  }

}
