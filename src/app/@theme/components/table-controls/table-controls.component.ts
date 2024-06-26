import {Component, Input, OnInit} from "@angular/core";
import {EmitService} from "@shared/services/emit.service";

@Component({
  selector: "app-table-controls",
  templateUrl: "./table-controls.component.html",
  styleUrls: ["./table-controls.component.scss"],
})
export class TableControlsComponent implements OnInit {
  @Input() viewLink: string;
  @Input() updateLink: string;
  @Input() id: number;
  @Input() userTypeId: number;
  @Input() showView = true;
  @Input() showDelete = true;
  @Input() showUpdate = true;
  @Input() showInvoice = true;
  @Input() entityName: string;
  @Input() Goto: string;

  constructor(private emitService: EmitService) {
  }



  ngOnInit(): void {
  }

  emitId(itemId: number) {
    this.emitService.sendItemId(itemId);
  }
}
