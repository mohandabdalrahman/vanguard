import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { PendingRequestCard } from "../pending-requests.model";
import { PendingRequestsTabs } from "../pending-requests-tabs.model";
import { Router } from "@angular/router";
import { SystemType } from "@models/system-type";

@Component({
  selector: "app-pending-requests-card",
  templateUrl: "./pending-requests-card.component.html",
  styleUrls: ["./pending-requests-card.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PendingRequestsCardComponent implements OnInit {
  @Input() cardData: PendingRequestCard[] = [];
  @Input() currentTab: PendingRequestsTabs;
  @Input() systemType: SystemType;
  @Input() viewPage: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    switch (this.currentTab) {
      case PendingRequestsTabs.PRODUCT: {
        this.cardData = this.cardData.filter(
          (item) => item.domainEntityTypeName === PendingRequestsTabs.PRODUCT
        );
        break;
      }
      case PendingRequestsTabs.MERCHANT: {
        this.cardData = this.cardData.filter(
          (item) => item.domainEntityTypeName === PendingRequestsTabs.MERCHANT
        );
        break;
      }
    }
  }

  navigateToPendingDetails(id: number) {
    const selectedCard = this.cardData.find((item) => item.id === id);
    this.router.navigate([this.router.url, id, "details"], {
      state: {
        cardData: selectedCard,
        currentTab: this.currentTab,
        systemType: this.systemType,
      },
    });
  }
}
