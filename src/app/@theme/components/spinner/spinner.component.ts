import {Component, Input, OnInit} from "@angular/core";
import { LoaderService } from "@shared/services/loader.service";

@Component({
  selector: "app-spinner",
  templateUrl: "./spinner.component.html",
  styleUrls: ["./spinner.component.scss"],
})
export class SpinnerComponent implements OnInit {
  @Input() bdColor = "rgba(51,51,51,0.8)";
  @Input() type = "";
  loader:boolean;
  constructor(private LoaderService:LoaderService) {}

  ngOnInit(): void {
    this.LoaderService.loading.subscribe((res)=>{
      this.loader=res
    })
  }
}
