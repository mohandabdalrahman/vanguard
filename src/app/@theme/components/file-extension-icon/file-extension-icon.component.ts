import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-file-extension-icon",
  templateUrl: "./file-extension-icon.component.html",
  styleUrls: ["./file-extension-icon.component.scss"],
})
export class FileExtensionIconComponent implements OnInit {
  @Input() fileName: string;

  iconImagesList = [
    { type: "pdf", src: "assets/img/merchants/icon-images/pdf.png" },
    { type: "doc", src: "assets/img/merchants/icon-images/doc.png" },
    { type: "docx", src: "assets/img/merchants/icon-images/docx.png" }
  ];

  constructor() {}

  ngOnInit(): void {}

  getIconImageSrc(fileName) {
    let extention = fileName.split(".").pop();
    let iconImage = this.iconImagesList.find(icon => icon.type === extention);
    return iconImage ? iconImage.src : '';
  }
}
