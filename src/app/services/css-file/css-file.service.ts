import {Inject, Injectable} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {NbLayoutDirection, NbLayoutDirectionService} from "@nebular/theme";

@Injectable({
  providedIn: "root",
})
export class CssFileService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private layoutService: NbLayoutDirectionService
  ) {
  }

  changeCssFile(lang: string) {
    let headTag = this.document.getElementsByTagName(
      "head"
    )[0] as HTMLHeadElement;

    let existingLink = this.document.getElementById(
      "langCss"
    ) as HTMLLinkElement;
  
    let bundleName = lang === "ar" ? "arabicStyle.css" : "englishStyle.css";

    if (existingLink) {
      existingLink.href = bundleName;
    } else {
      let newLink = this.document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.type = "text/css";
      newLink.id = "langCss";
      newLink.href = bundleName;
      headTag.appendChild(newLink);
    }
  }

  changeDirAttribute(lang: string) {
    let htmlTag = this.document.getElementsByTagName(
      "html"
    )[0] as HTMLHtmlElement;
    if (htmlTag) {
      htmlTag.dir = "rtl";
    }else{
      htmlTag.dir = "ltr"
    }
    if (lang === "ar") {
      this.layoutService?.setDirection(NbLayoutDirection.RTL);
    } else {
      this.layoutService?.setDirection(NbLayoutDirection.LTR);
    }
  }
  
}
