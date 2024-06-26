import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-info-details-tag",
  templateUrl: "./info-details-tag.component.html",
  styleUrls: ["./info-details-tag.component.scss"],
})
export class InfoDetailsTagComponent implements OnInit {
  @Input() image: string;
  @Input() text: string;
  @Input() length: number;

  constructor() {}

  ngOnInit(): void {}
}
