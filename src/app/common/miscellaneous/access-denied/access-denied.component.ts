import { Component, OnInit } from "@angular/core";
import { NbMenuService } from "@nebular/theme";

@Component({
  selector: "app-access-denied",
  templateUrl: "./access-denied.component.html",
  styleUrls: ["./access-denied.component.scss"],
})
export class AccessDeniedComponent implements OnInit {
  constructor(private menuService: NbMenuService) {}

  ngOnInit(): void {}

  goToHome() {
    this.menuService.navigateHome();
  }
}
