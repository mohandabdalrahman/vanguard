import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ExportButtonComponent implements OnInit {
  @Input() exportFunc: Function;

  constructor() {
  }

  ngOnInit(): void {
  }

}
