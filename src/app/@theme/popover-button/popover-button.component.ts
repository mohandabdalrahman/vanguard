import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {NbPosition, NbTrigger} from "@theme/popover-button/popover.model";

@Component({
  selector: 'app-popover-button',
  templateUrl: './popover-button.component.html',
  styleUrls: ['./popover-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PopoverButtonComponent implements OnInit {
  @Input() popoverText: string;
  @Input() popoverContent: string;
  @Input() popoverIcon: string;
  @Input() routerLink: string;
  @Input() popoverPlacement: NbPosition = NbPosition.TOP;
  @Input() popoverTrigger: NbTrigger  = NbTrigger.HOVER;

  constructor() { }

  ngOnInit(): void {
  }

}
