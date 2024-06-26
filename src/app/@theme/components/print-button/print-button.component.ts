import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { PdfService } from '@shared/services/pdf.service';

@Component({
  selector: 'app-print-button',
  templateUrl: './print-button.component.html',
  styleUrls: ['./print-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PrintButtonComponent implements OnInit {
  @Input() fileName:string
  @Input() defaultPrint = true
  // @Input() qrData : string;

  constructor(private pdfService:PdfService) {
  }

  ngOnInit(): void {
  }

  print() {
    this.pdfService.exportAsPDF(document.getElementById('printable'), this.fileName,this.defaultPrint);
    // this.pdfService.usePDFMake(null,null,null,this.qrData,null,null)
  }
}
