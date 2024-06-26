import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ContextMenu} from "@theme/components/context-menu/context-menu.model";

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ContextMenuComponent implements OnInit {
  @Input() items: ContextMenu[] = [];
  @Input() node: any;
  showMenu = false;
  showDrawer = false;

  constructor(private eRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showMenu = false;
      this.showDrawer = false;
    }
  }

  ngOnInit(): void {
  }

  handleShowMenu() {
    this.showMenu = !this.showMenu;
    this.showDrawer = false;
  }

  showDrawerDetails() {
    this.showDrawer = !this.showDrawer;
  }
}
