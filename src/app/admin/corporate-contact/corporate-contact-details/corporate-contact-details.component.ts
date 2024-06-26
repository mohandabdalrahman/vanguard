import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ContactType} from "@models/contact-type.model";
import {ContactTypeService} from "@shared/services/contact-type.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Corporate} from "../../corporates/corporate.model";
import {CorporateService} from "../../corporates/corporate.service";
import {CorporateContactService} from "../corporate-contact.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-corporate-contact-details",
  templateUrl: "./corporate-contact-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-contact-details.component.scss",
  ],
})
export class CorporateContactDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateContact: any;
  corporateId: number;
  corporateContactId: number;
  corporateName: string;
  contactTypeName: string;
  userType: string;
  currentLang: string
  status: string;

  constructor(
    private route: ActivatedRoute,
    private corporateContactService: CorporateContactService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private corporateService: CorporateService,
    private contactTypeService: ContactTypeService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
    this.corporateContact = {};
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.corporateContactId = params["corporateContactId"];
      })
    );
    if (this.corporateId && this.corporateContactId) {
      this.showCorporateContactDetails();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
    this.getCorporateName();
  }

  showCorporateContactDetails(): void {
    
    this.subs.add(
      this.corporateContactService
        .getCorporateContact(this.corporateId, this.corporateContactId)
        .subscribe(
          (corporateContact) => {
            if (corporateContact) {
              const {contactTypeId, suspended, ...other} =
                removeUnNeededProps(corporateContact, ["id", "corporateId"]);
              this.corporateContact = other;
              this.status = !suspended? "active": "inactive";
              this.getContactType(contactTypeId);
            } else {
              this.translate.get(["error.noContactsFound", "type.warning"]).subscribe(
                (res) => {
                  this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
                }
              );
              //this.toastr.warning("Corporate contact not found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateName() {
    if (this.corporateId) {
      
      this.subs.add(
        this.corporateService.getCorporate(this.corporateId).subscribe(
          (corporate: Corporate) => {
            if (corporate) {
              this.corporateContact["corporateName"] = this.currentLang === "en" ? (corporate.enName) : (corporate.localeName);
            } else {
              this.translate.get(["error.noCorporateFound", "type.warning"]).subscribe(
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
      console.error("no corporate id provided");
    }
  }

  getContactType(contactTypeId: number) {
    if (contactTypeId) {
      
      this.subs.add(
        this.contactTypeService.getContactType(contactTypeId).subscribe(
          (contactType: ContactType) => {
            if (contactType) {
              this.corporateContact["contactTypeName"] =
                this.currentLang === "en" ? (contactType?.enName ?? "") : (contactType?.localeName ?? "");
            } else {
              this.translate.get(["error.noContactTypeFound", "type.warning"]).subscribe(
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
