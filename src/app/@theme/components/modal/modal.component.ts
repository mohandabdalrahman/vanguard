import {Component, Input, OnInit, TemplateRef, ViewChild,} from "@angular/core";
import {Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent implements OnInit {
  @ViewChild("modal") private modalContent: TemplateRef<ModalComponent>;
  @Input() redirectUrl: string;
  @Input() buttonText: string;
  @Input() size: 'sm' | 'lg' | 'xl' | '' = ''
  @Input() centerView: boolean;
  @Input() showCloseBtn = true;

  constructor(private modalService: NgbModal, private router: Router) {
  }

  ngOnInit(): void {
  }

  open(modalDialogClass?: string, scrollable?: boolean) {
    this.modalService.open(this.modalContent, {centered: true, size: this.size, modalDialogClass, scrollable,});
  }

  closeModal() {
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    }
    this.modalService.dismissAll();
  }
}
