import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ContactType } from "@models/contact-type.model";
import { BaseResponse } from "@models/response.model";
import { ContactTypeService } from "@shared/services/contact-type.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { Corporate } from "../../corporates/corporate.model";
import { CorporateService } from "../../corporates/corporate.service";
import { CorporateContact } from "../corporate-contact.model";
import { CorporateContactService } from "../corporate-contact.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { AuthService } from "../../../auth/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EMAIL_REGEX } from "@shared/constants";

@Component({
  selector: "app-create-corporate-contact",
  templateUrl: "./create-corporate-contact.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-corporate-contact.component.scss",
  ],
})
export class CreateCorporateContactComponent implements OnInit, OnDestroy {
  @ViewChild("corporateContactForm") submitForm: NgForm;
  private subs = new SubSink();
  corporateContact = new CorporateContact();
  contactTypes: ContactType[] = [];
  corporateId: number;
  corporateContactId: number;
  corporateName: string;
  isUpdateView: boolean;
  active = true;
  userType: string;
  currentLang: string;
  EMAIL_REGEX = EMAIL_REGEX;

  constructor(
    private route: ActivatedRoute,
    private corporateContactService: CorporateContactService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private corporateService: CorporateService,
    private contactTypeService: ContactTypeService,
    private authService: AuthService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.getCorporateName();
      }),
      this.route.params.subscribe((params) => {
        this.corporateContactId = params["corporateContactId"];
      })
    );
    this.getContactTypes();
    if (this.corporateId && this.corporateContactId && this.isUpdateView) {
      this.getCorporateContact();
    }
  }

  getCorporateName() {
    if (this.corporateId) {
      
      this.subs.add(
        this.corporateService.getCorporate(this.corporateId).subscribe(
          (corporate: Corporate) => {
            if (corporate) {
              this.corporateName =
                this.currentLang === "en"
                  ? corporate.enName
                  : corporate.localeName;
            } else {
              this.translate
                .get(["error.noCorporateFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.translate
        .get(["error.invalidUrl", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  getContactTypes() {
    
    this.subs.add(
      this.contactTypeService.getContactTypes({ suspended: false }).subscribe(
        (contactTypes: BaseResponse<ContactType>) => {
          if (contactTypes.content?.length > 0) {
            this.contactTypes = contactTypes.content;
          } else {
            this.translate
              .get(["error.noContactTypeFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  createCorporateContact() {
    this.corporateContact.suspended = !this.active;
    if (this.submitForm.valid) {
      this.corporateContact.corporateId = this.corporateId;
      
      this.subs.add(
        this.corporateContactService
          .createCorporateContact(this.corporateId, this.corporateContact)
          .subscribe(
            (contact) => {
              this.translate.get("createSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, contact.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate
        .get(["error.fillMandatoryFields", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  updateCorporateContact() {
    this.corporateContact.suspended = !this.active;
    if (this.submitForm.valid && this.corporateContactId && this.corporateId) {
      
      this.subs.add(
        this.corporateContactService
          .updateCorporateContact(
            this.corporateId,
            this.corporateContactId,
            this.corporateContact
          )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe((res) => {
                this.handleSuccessResponse(res, this.corporateContact.id);
              });
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate
        .get(["error.fillMandatoryFields", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  getCorporateContact(): void {
    
    this.subs.add(
      this.corporateContactService
        .getCorporateContact(this.corporateId, this.corporateContactId)
        .subscribe(
          (corporateContact) => {
            if (corporateContact) {
              this.corporateContact = corporateContact;
              this.active = !this.corporateContact.suspended;
            } else {
              this.translate
                .get(["error.noContactsFound", "type.warning"])
                .subscribe((res) => {
                  this.toastr.warning(
                    Object.values(res)[0] as string,
                    Object.values(res)[1] as string
                  );
                });
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  handleSuccessResponse(msg: string, contactId?: number) {
    
    if (this.userType === "admin" || this.userType === "master_corporate") {
      this.router.navigate([
        `/${this.userType}/corporates`,
        this.corporateId,
        "details",
        "contacts",
        contactId,
        "details",
      ]);
    } else {
      this.router.navigate(["/corporate", "contacts", contactId, "details"]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
