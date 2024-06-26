import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  searchVal: string;
  showAdvanceSearch: boolean;
  @Output() onSearch = new EventEmitter();
  @Input() showTitle = true;
  @Input() searchInsideTab = false;
  constructor() {}

  ngOnInit(): void {}

  search(searchVal: string) {
    if (searchVal) {
      this.onSearch.emit(searchVal);
    }
  }
}
