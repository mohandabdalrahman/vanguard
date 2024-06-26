import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-left-table-header",
  templateUrl: "./left-table-header.component.html",
  styleUrls: ["./left-table-header.component.scss"],
})
export class LeftTableHeaderComponent implements OnInit {
  @Input() title: string;
  @Input() name: string;
  @Input() unitName: string;
  @Input() length: number;
  @Input() icon: string = './assets/img/icons-corporates.svg';
  admintransactions:boolean=false
  constructor(private route:ActivatedRoute) {}

  ngOnInit(): void {
    if(this.route.snapshot.data.pageTitle=="admin transactions"){
      this.admintransactions=true
    }
  }
}
