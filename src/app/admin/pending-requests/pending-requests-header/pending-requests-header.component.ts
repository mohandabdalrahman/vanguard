import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { EntityAction } from "@models/work-flow.model";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { Merchant } from "../../merchants/merchant.model";
import { Corporate } from "../../corporates/corporate.model";
import { SystemType } from "@models/system-type";

@Component({
  selector: "app-pending-requests-header",
  templateUrl: "./pending-requests-header.component.html",
  styleUrls: ["./pending-requests-header.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PendingRequestsHeaderComponent implements OnInit {
  @ViewChild("searchForm") submitForm: NgForm;
  @Input() systemType: SystemType;
  @Input() systemData: Merchant | Corporate[] = [];
  @Output() onSearchFormChange = new EventEmitter();
  @Input() totalPendingRequests: number;
  currentLang: string;
  merchants: Merchant[] = [];
  corporates: Corporate[] = [];
  rangeDate = new Date();
  entityActions: EntityAction[] = Object.keys(EntityAction).map(
    (key) => EntityAction[key]
  );

  constructor(private currentLangService: CurrentLangService) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
  }

  handleSearch() {
    if (this.submitForm.value) {
      this.onSearchFormChange.emit(this.submitForm.value);
    }
  }
}
