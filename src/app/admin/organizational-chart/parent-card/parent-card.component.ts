import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ContextMenu} from "@theme/components/context-menu/context-menu.model";

@Component({
  selector: 'app-parent-card',
  templateUrl: './parent-card.component.html',
  styleUrls: ['./parent-card.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ParentCardComponent implements OnInit {
  @Input() items: ContextMenu[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
