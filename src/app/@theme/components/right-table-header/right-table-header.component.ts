import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-right-table-header",
  templateUrl: "./right-table-header.component.html",
  styleUrls: ["./right-table-header.component.scss"],
})
export class RightTableHeaderComponent implements OnInit {
  @Input() addText: string;
  @Input() role: string;
  @Input() showCreateBtn = true;
  constructor() {}

  ngOnInit(): void {}
}
