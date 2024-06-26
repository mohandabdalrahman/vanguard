import {Component, Input, OnInit, TemplateRef, ViewChild,} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-invoice-modal",
  templateUrl: "./invoice-modal.component.html",
  styleUrls: ["./invoice-modal.component.scss"],
})
export class InvoiceModalComponent implements OnInit {
  @ViewChild("modal") private modalContent: TemplateRef<InvoiceModalComponent>;
  @Input() title: string;
  @Input() name: string;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  open() {
    this.modalService.open(this.modalContent, {size: 'xl', backdrop: true, scrollable: true});
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
