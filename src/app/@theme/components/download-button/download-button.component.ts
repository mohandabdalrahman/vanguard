import { Component, Input, OnInit } from "@angular/core";
import { AttachmentService } from "@shared/attachments/attachment.service";
import { ErrorService } from "@shared/services/error.service";

import { SubSink } from "subsink";

@Component({
  selector: "app-download-button",
  templateUrl: "./download-button.component.html",
  styleUrls: ["./download-button.component.scss"],
})
export class DownloadButtonComponent implements OnInit {
  @Input() id: number;
  @Input() merchantId: number;
  @Input() fileToDownload: string;
  @Input() fileName: string;

  private subs = new SubSink();

  constructor(
    private attachmentService: AttachmentService,
    
    private errorService: ErrorService,
    ) {}

  ngOnInit(): void {}
  

  download() {
    switch (this.fileToDownload) {
      case 'merchantAttachment':
        this.downloadAttachment(this.fileName);
        break;
    
      default:
        break;
    }
  }

  downloadAttachment(fileName: string) {
    
    this.subs.add(
      this.attachmentService
        .downloadAttachment(this.merchantId, this.id)
        .subscribe(
          (response) => {
            this.downLoadFile(response, fileName);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  downLoadFile(response: any, fileName: string) {
    let dataType = response.type;
    let binaryData = [];
    binaryData.push(response);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
    if (fileName)
      downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
