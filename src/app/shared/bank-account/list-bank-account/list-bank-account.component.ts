import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { BankAdvanceSearch } from "@models/place.model";
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { EmitService } from "@shared/services/emit.service";
import { ErrorService } from "@shared/services/error.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { DeleteModalComponent } from "@theme/components";
import { Country } from "../../../admin/countries/country.model";
import { CountryService } from "../../../admin/countries/country.service";
import { Bank } from "../bank-account.model";
import { BankService } from "../bank.service";
import { BankGridData } from "./../bank-account.model";
import { SortView } from "@models/sort-view.model";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-bank-account",
  templateUrl: "./list-bank-account.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-bank-account.component.scss",
  ],
})
export class ListBankAccountComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  banks: Bank[] = [];
  countries: Country[] = [];
  bankId: number;
  country: Country;
  bank = new Bank();
  currentLang: string;
  gridData: BankGridData[] = [];
  colData: any[] = [];
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  destroyed = new Subject<any>();

  constructor(
    private bankService: BankService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.banks);
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.bankId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getCountries();
        }
      }),
    );
    this.getCountries();
  }

  setColData(lang: string) {
    this.colData = [
      { field: "id", header: "bankAccount.id" },
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "bankAccount.bankName" : "bankAccount.bankName"
        }`,
      },
      { field: "country", header: "country.enName" },
      { field: "status", header: "app.status" },
    ];
  }

  setGridData(data: Bank[]) {
    this.gridData = data.map((bank) => {
      return {
        id: bank?.id,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en" ? bank.enName : bank.localeName,
        country:
          this.countries.find((country) => country.id === bank.countryId)
            ?.enName ?? "",
        status: !bank.suspended ? "active" : "inactive",
      };
    });
  }

  //  get banks
  getBanks(searchObj?: BankAdvanceSearch) {
    
    this.subs.add(
      this.bankService
        .getBanks(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (banks: BaseResponse<Bank>) => {
            if (banks.content?.length > 0) {
              this.totalElements = banks.totalElements;
              this.banks = banks.content;
              this.setGridData(this.banks);
            } else {
              this.banks = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noBanksFound", "type.warning"])
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

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries().subscribe(
        (countries: BaseResponse<Country>) => {
          if (countries.content?.length > 0) {
            this.countries = countries.content;
            this.getBanks();
          } else {
            this.translate
              .get(["error.noCountryFound", "type.warning"])
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

  deleteBank() {
    
    this.subs.add(
      this.bankService.deleteBank(this.bankId).subscribe(
        () => {
          this.deleteModalComponent.closeModal();
          this.translate.get("deleteSuccessMsg").subscribe((res) => {
            this.toastr.success(res);
          });
          this.getBanks();
          
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
      this.getBanks(this.submitForm?.value);
    }else{
      this.getBanks();
    }
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getBanks(this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
