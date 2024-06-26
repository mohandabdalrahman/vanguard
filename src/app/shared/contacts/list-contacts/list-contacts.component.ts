import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ContactType } from "@models/contact-type.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { ContactTypeService } from "@shared/services/contact-type.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { Contact, ContactGridData, ContactSearch } from "../contact.model";
import { ContactService } from "../contact.service";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-contacts",
  templateUrl: "./list-contacts.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-contacts.component.scss",
  ],
})
export class ListContactsComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  merchantId: number;
  contactTypes: ContactType[] = [];
  currentLang: string;
  gridData: ContactGridData[] = [];
  colData: any[] = [];
  merchantContacts: Contact[] = [];
  merchantContactId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private contactTypeService: ContactTypeService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService : QueryParamsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.merchantContacts);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.merchantContactId = id;
        this.deleteModalComponent.open();
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getContacts(this.merchantId);
        }
      }),
    );
    this.getContacts(this.merchantId);
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "contact.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "contact.enName" : "contact.localeName"}`,
      },
      { field: "officeNumber", header: "contact.officeNumber" },
      { field: "faxNumber", header: "contact.faxNumber" },
      { field: "mobileNumber", header: "contact.mobileNumber" },
      { field: "contactType", header: "corporateContact.contactTypeName" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: Contact[]) {
    this.gridData = data.map((contact) => {
      const contactType = this.contactTypes.find(
        (contactType) => contactType.id === contact.contactTypeId
      );
      return {
        id: contact.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? contact.enName : contact.localeName,
        officeNumber: contact.officeNumber,
        faxNumber: contact.faxNumber,
        mobileNumber: contact.mobileNumber,
        contactType:
          this.currentLang === "en"
            ? contactType?.enName
            : contactType?.localeName,
        status: !contact.suspended ? "active" : "inactive",
      };
    });
  }

  getContacts(merchantId: number, searchObj?: ContactSearch) {
    
    this.subs.add(
      this.contactService
        .getContacts(
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (contacts: BaseResponse<Contact>) => {
            if (contacts.content?.length > 0) {
              this.totalElements = contacts.totalElements;
              this.merchantContacts = contacts.content;
              this.getContactTypes();
            } else {
              this.merchantContacts = [];
              this.totalElements = 0;
              this.setGridData([]);
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

  getContactTypes() {
    
    this.subs.add(
      this.contactTypeService.getContactTypes().subscribe(
        (contactTypes: BaseResponse<ContactType>) => {
          if (contactTypes.content?.length > 0) {
            this.contactTypes = contactTypes.content;
            this.setGridData(this.merchantContacts);
          } else {
            this.translate
              .get(["error.noContactTypesFound", "type.warning"])
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

  deleteMerchantContact() {
    
    this.subs.add(
      this.contactService
        .deleteContact(this.merchantId, this.merchantContactId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getContacts(this.merchantId);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getContacts(this.merchantId, this.submitForm?.value);
    }else{
      this.getContacts(this.merchantId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getContacts(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
