import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {TranslateService} from "@ngx-translate/core";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {AttachmentService} from "../attachment.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {Attachment} from "../attachment.model";
import {CorporateAttachmentService} from "../corporate.attachment.service";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: "app-list-attachments",
  templateUrl: "./list-attachments.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-attachments.component.scss",
  ],
})
export class ListAttachmentsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  merchantId: number;
  showAdvanceSearch: boolean;
  currentLang: string = "en";
  gridData: Attachment[] = [];
  colData: any[] = [];
  attachments: Attachment[] = [];
  corporateId: number;

  constructor(
    private route: ActivatedRoute,
    private attachmentService: AttachmentService,
    private corporateAttachmentService: CorporateAttachmentService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = sessionStorage.getItem("lang");
    this.setColData();
    this.translate.onLangChange.subscribe(({lang}) => {
      this.currentLang = lang;
      this.setColData();
    });
    const userType = this.authService.getUserType();
    switch(userType){
      case 'merchant':
        this.subs.add(
          this.route.parent.params.subscribe((params) => {
            this.merchantId = +getRelatedSystemId(params, "merchantId");
            this.getAttachments(this.merchantId);
          })
        );
        break;
      case 'corporate':
        this.subs.add(
          this.route.parent.params.subscribe((params) => {
            this.corporateId = +getRelatedSystemId(params, "corporateId");
            this.getCorporateAttachments(this.corporateId);
          })
        );
        break;
      case 'admin':
        this.subs.add(
          this.route.parent.params.subscribe((params) => {
            if (params.corporateId) {
              this.corporateId = +getRelatedSystemId(params, "corporateId");
              this.getCorporateAttachments(this.corporateId);
            } else if (params.merchantId) {
              this.merchantId = +getRelatedSystemId(params, "merchantId");
              this.getAttachments(this.merchantId);
            }
          })
        )
    }

  }

  setColData() {
    this.colData = [
      {field: "fileName", header: "attachment.fileName"},
      {field: "documentType", header: "attachment.documentType"},
      {field: "downloadUrl", header: "attachment.downloadUrl"},
    ];
  }

  getCorporateAttachments(corporateId: number, searchObj?) {
    
    this.subs.add(
      this.corporateAttachmentService
        .getAttachments(corporateId, removeNullProps(searchObj))
        .subscribe(
          (attachments: Attachment[]) => {
            if (attachments?.length > 0) {
              this.gridData = attachments;
            } else {
              this.translate.get(["error.noAttachmentsFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getAttachments(merchantId: number, searchObj?) {
    
    this.subs.add(
      this.attachmentService
        .getAttachments(merchantId, removeNullProps(searchObj))
        .subscribe(
          (attachments: Attachment[]) => {
            if (attachments?.length > 0) {
              this.gridData = attachments;
            } else {
              this.translate.get(["error.noAttachmentsFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
