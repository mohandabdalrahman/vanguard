import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-overwrite-confirm-modal',
  templateUrl: './overwrite-confirm-modal.component.html',
  styleUrls: ['./overwrite-confirm-modal.component.scss']
})
export class OverwriteConfirmModalComponent implements OnInit {
  @ViewChild("modal") private modalContent: TemplateRef<OverwriteConfirmModalComponent>;
  @Input() title: string;
  @Input() body: string;

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
