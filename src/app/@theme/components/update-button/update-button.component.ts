import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-update-button",
  templateUrl: "./update-button.component.html",
  styleUrls: ["./update-button.component.scss"],
})
export class UpdateButtonComponent implements OnInit {
  @Input() path;
  @Input() role;
  @Input() cssClass = 'btn-primary'
  constructor() {}

  ngOnInit(): void {}
}
