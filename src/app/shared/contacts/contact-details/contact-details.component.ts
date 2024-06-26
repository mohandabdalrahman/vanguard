import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ContactType} from "@models/contact-type.model";
import {ContactTypeService} from "@shared/services/contact-type.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {ContactService} from "../contact.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-contact-details",
  templateUrl: "./contact-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./contact-details.component.scss",
  ],
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  contact = {};
  merchantId: number;
  contactId: number;
  contactTypeName: string;
  userType: string;
  currentLang: string;
  active: boolean;
  contactType: ContactType

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private contactTypeService: ContactTypeService,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.contact["type"] = this.currentLang === "en" ? (this.contactType?.enName ?? "") : (this.contactType?.localeName ?? "");
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.contactId = params["contactId"];
      })
    );
    if (this.merchantId && this.contactId) {
      this.showContactDetails();
    } else {
      this.toastr.error("Invalid URL", "Error");
    }
  }

  showContactDetails(): void {
    
    this.subs.add(
      this.contactService.getContact(this.merchantId, this.contactId).subscribe(
        (contact) => {
          if (contact) {
            const {
              contactTypeId,
              mailingList,
              suspended,
              ...other
            } = removeUnNeededProps(contact, ['id', 'merchantId']);
            this.contact = other;
            // this.contact["suspended"] = !suspended;
            this.active = !suspended;
            this.contact["mailList"] = mailingList;
            this.getContactType(contactTypeId);
          } else {
            this.translate.get(["error.noContactsFound", "type.warning"]).subscribe(
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

  getContactType(contactTypeId: number) {
    if (contactTypeId) {
      
      this.subs.add(
        this.contactTypeService.getContactType(contactTypeId).subscribe(
          (contactType: ContactType) => {
            if (contactType) {
              this.contactType = contactType
              this.contact["type"] = this.currentLang === "en" ? (this.contactType?.enName ?? "") : (this.contactType?.localeName ?? "");
            } else {
              this.translate.get(["error.noContactTypesFound", "type.warning"]).subscribe(
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
    } else {
      console.error("no contact type id provided");
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
