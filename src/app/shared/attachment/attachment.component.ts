import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {FileUploader} from "ng2-file-upload";
import {Document, DocumentType} from "@models/document.model";


@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AttachmentComponent implements OnInit {
  @Input() controller: any;
  contractUploader: FileUploader;
  bankStatementUploader: FileUploader;
  taxIdUploader: FileUploader;
  otherUploader: FileUploader;
  isContractZoneOver: boolean;
  isBankZoneOver: boolean;
  isTaxZoneOver: boolean;
  isOtherZoneOver: boolean;
  showAttachments: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.configureUploadSettings();

  }

  configureUploadSettings() {
    this.contractUploader = this.createFileUploader();
    this.removeLastFileOnAdd(this.contractUploader);

    this.bankStatementUploader = this.createFileUploader();
    this.removeLastFileOnAdd(this.bankStatementUploader);

    this.taxIdUploader = this.createFileUploader();
    this.removeLastFileOnAdd(this.taxIdUploader);

    this.otherUploader = this.createFileUploader();
    this.removeLastFileOnAdd(this.otherUploader);
  }

  uploadContract() {
    this.attachDocument(this.contractUploader, DocumentType.CONTRACT);
  }

  uploadBankStatement() {
    this.attachDocument(
      this.bankStatementUploader,
      DocumentType.COMMERCIAL_REGISTRATION
    );
  }

  uploadTaxId() {
    this.attachDocument(this.taxIdUploader, DocumentType.TAX_FILE_NUMBER);
  }

  uploadOther() {
    this.attachDocument(this.otherUploader, DocumentType.OTHER);
  }

  attachDocument(uploader: FileUploader, documentType: DocumentType) {
    if (uploader.queue.length) {
      let file = uploader.queue[0]._file;
      if (!this.controller.documents) this.controller.documents = [];
      let documentIndex = this.controller.documents.findIndex(
        (document) => document.documentType === documentType
      );

      let contractDocument: Document = {
        documentType,
        fileName: file.name,
        documentFormat: file.type,
      };

      if (documentIndex > -1) {
        this.controller.documents[documentIndex] = contractDocument;
      } else {
        this.controller.documents.push(contractDocument);
        documentIndex = this.controller.documents.length - 1;
      }

      let fileReader = new FileReader();
      fileReader.onloadend = () => {
        let fileData = fileReader.result as string;
        let rawData = fileData.split("base64,");

        if (rawData.length > 1) {
          let fileContentBase64 = rawData[1];
          this.controller.documents[documentIndex].fileContentBase64 =
            fileContentBase64;
        }
      };
      fileReader.readAsDataURL(uploader.queue[0]._file);
    }
  }

  markContractFileOver(e: any): void {
    this.showAttachments = true;
    this.isContractZoneOver = e;
  }

  markBankFileOver(e: any): void {
    this.isBankZoneOver = e;
  }

  markTaxFileOver(e: any): void {
    this.isTaxZoneOver = e;
  }

  markOtherFileOver(e: any): void {
    this.isOtherZoneOver = e;
  }

  createFileUploader(): FileUploader {
    return new FileUploader({
      allowedFileType: ["pdf", "doc", "docx"],
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item) => {
        return new Promise((resolve) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date(),
          });
        });
      },
    });
  }

  removeLastFileOnAdd(uploader: FileUploader) {
    uploader.onAfterAddingFile = () => {
      if (uploader.queue.length > 1) {
        uploader.removeFromQueue(uploader.queue[0]);
      }
    };
  }

}
