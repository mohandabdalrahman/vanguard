import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { ContactType } from "@models/contact-type.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { ContactGridData } from "@shared/contacts/contact.model";
import { ContactTypeService } from "@shared/services/contact-type.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import {
  CorporateContact,
  CorporateContactSearch,
} from "../corporate-contact.model";
import { CorporateContactService } from "../corporate-contact.service";
import { SortView } from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-corporate-contact",
  templateUrl: "./list-corporate-contact.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-contact.component.scss",
  ],
})
export class ListCorporateContactComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  contactTypes: ContactType[] = [];
  gridData: ContactGridData[] = [];
  colData: ColData[] = [];
  corporateContacts: CorporateContact[] = [];
  corporateContactId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private corporateContactService: CorporateContactService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private contactTypeService: ContactTypeService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.corporateContacts);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getCorporateContacts(this.corporateId);
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporateContactId = id;
        this.deleteModalComponent.open();
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      })
    );

    this.getCorporateContacts(this.corporateId);
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "corporateContact.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en"
            ? "corporateContact.enName"
            : "corporateContact.localeName"
        }`,
      },
      { field: "officeNumber", header: "corporateContact.officeNumber" },
      { field: "faxNumber", header: "corporateContact.faxNumber" },
      { field: "mobileNumber", header: "corporateContact.mobileNumber" },
      { field: "contactType", header: "corporateContact.contactTypeName" },
      { field: "status", header: "corporateContact.status" },
    ];
  }

  setGridData(data: CorporateContact[]) {
    this.gridData = data.map((corporateContact) => {
      const contactType = this.contactTypes.find(
        (contactType) => contactType.id === corporateContact.contactTypeId
      );
      return {
        id: corporateContact.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? corporateContact.enName
            : corporateContact.localeName,
        officeNumber: corporateContact.officeNumber,
        faxNumber: corporateContact.faxNumber,
        mobileNumber: corporateContact.mobileNumber,
        contactType:
          this.currentLang === "en"
            ? contactType?.enName
            : contactType?.localeName,
        status: !corporateContact.suspended ? "active" : "inactive",
      };
    });
  }

  // get corporate contacts
  getCorporateContacts(
    corporateId: number,
    searchObj?: CorporateContactSearch
  ) {
    
    this.subs.add(
      this.corporateContactService
        .getCorporateContacts(
          corporateId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (corporateContacts: BaseResponse<CorporateContact>) => {
            if (corporateContacts.content?.length > 0) {
              this.totalElements = corporateContacts.totalElements;
              this.corporateContacts = corporateContacts.content;
              this.getContactTypes();
            } else {
              this.corporateContacts = [];
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
            this.setGridData(this.corporateContacts);
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

  deleteCorporateContact() {
    
    this.subs.add(
      this.corporateContactService
        .deleteCorporateContact(this.corporateId, this.corporateContactId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporateContacts(this.corporateId);
            
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
      this.getCorporateContacts(this.corporateId, this.submitForm?.value);
    }else{
      this.getCorporateContacts(this.corporateId);
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCorporateContacts(this.corporateId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
