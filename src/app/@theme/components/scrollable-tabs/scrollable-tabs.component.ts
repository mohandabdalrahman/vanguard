import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-scrollable-tabs",
  templateUrl: "./scrollable-tabs.component.html",
  styleUrls: ["./scrollable-tabs.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ScrollableTabsComponent implements OnInit {
  @Input() tabs: { path: string; count: number }[];
  selectedIndex = 0;
  abc: string;
  leftTabIdx = 0;
  atStart = true;
  atEnd = false;

  constructor() {}

  ngOnInit(): void {
    this.abc = `translateX(0px)`;
  }

  selectTab(index) {
    this.selectedIndex = index;
    this.scrollTab(index - this.leftTabIdx - 1);
  }

  scrollTab(x) {
    if ((this.atStart && x < 0) || (this.atEnd && x > 0)) {
      return;
    }
    this.leftTabIdx = this.leftTabIdx + x;
    this.abc = `translateX(${this.leftTabIdx * -100}px)`;
    this.atStart = this.leftTabIdx === 0;
    this.atEnd = this.leftTabIdx === this.tabs.length - 1;
  }
}
