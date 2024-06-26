import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ContactType} from "@models/contact-type.model";
import {BaseResponse} from "@models/response.model";
import {ContactTypeService} from "@shared/services/contact-type.service";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {ContactService} from "../contact.service";
import {Contact} from "./../contact.model";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EMAIL_REGEX} from "@shared/constants";

@Component({
  selector: "app-create-contact",
  templateUrl: "./create-contact.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-contact.component.scss",
  ],
})
export class CreateContactComponent implements OnInit, OnDestroy {
  @ViewChild("contactForm") submitForm: NgForm;
  private subs = new SubSink();
  contact = new Contact();
  contactTypes: ContactType[] = [];
  merchantId: number;
  contactId: number;
  active = true;
  isUpdateView: boolean;
  userType: string;
  currentLang: string;
  EMAIL_REGEX = EMAIL_REGEX;

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    
    private toastr: ToastrService,
    private router: Router,
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
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.contactId = params["contactId"];
      })
    );
    this.getContactTypes();
    if (this.merchantId && this.contactId && this.isUpdateView) {
      this.getContact();
    }
  }

  createContact() {
    this.contact.suspended = !this.active;
    if (this.submitForm.valid) {
      this.contact.merchantId = this.merchantId;
      
      this.subs.add(
        this.contactService
          .createContact(this.merchantId, this.contact)
          .subscribe(
            (contact) => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, contact.id);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  updateContact() {
    this.contact.suspended = !this.active;
    if (this.submitForm.valid && this.contactId && this.merchantId) {
      
      this.subs.add(
        this.contactService
          .updateContact(this.merchantId, this.contactId, this.contact)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.contactId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  getContact(): void {
    
    this.subs.add(
      this.contactService.getContact(this.merchantId, this.contactId).subscribe(
        (contact) => {
          if (contact) {
            this.contact = contact;
            this.active = !this.contact.suspended;
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

  getContactTypes() {
    
    this.subs.add(
      this.contactTypeService.getContactTypes({suspended: false}).subscribe(
        (contactTypes: BaseResponse<ContactType>) => {
          if (contactTypes.content?.length > 0) {
            this.contactTypes = contactTypes.content;
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
  }

  handleSuccessResponse(msg: string, contactId: number) {
    
    if (this.userType === 'admin') {
      this.router.navigate([
        "/admin/merchants",
        this.merchantId,
        "details",
        "contacts",
        contactId,
        "details",

      ]);
    } else {
      this.router.navigate([
        "/merchant",
        "contacts",
        contactId,
        "details",
      ]);
    }
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
