import {Component, Input, OnInit, TemplateRef, ViewChild,} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-delete-modal",
  templateUrl: "./delete-modal.component.html",
  styleUrls: ["./delete-modal.component.scss"],
})
export class DeleteModalComponent implements OnInit {
  @ViewChild("modal") private modalContent: TemplateRef<DeleteModalComponent>;
  @Input() title: string;
  @Input() name: string;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  open() {
    this.modalService.open(this.modalContent, {centered: true, size: "md"});
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
