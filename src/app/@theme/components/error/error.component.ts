import { Component, Input, OnInit } from "@angular/core";
@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrls: ["./error.component.scss"],
})
export class ErrorComponent implements OnInit {
  @Input() message: string;
  @Input() ref: any;
  @Input() errorType: string ;
  constructor() {
  }
  ngOnInit(): void { }

}
