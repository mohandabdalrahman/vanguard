import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class LoadingScreenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
