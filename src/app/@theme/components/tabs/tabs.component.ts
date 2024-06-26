import {Component, Input, OnInit} from '@angular/core';
import { StringDecoder } from 'string_decoder';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  @Input() tabs: { name?: string, path?: string, role?: string }| StringDecoder[];

  constructor() {
  }

  ngOnInit(): void {
  }

}
