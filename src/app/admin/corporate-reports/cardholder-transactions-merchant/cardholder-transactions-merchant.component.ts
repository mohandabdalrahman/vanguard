import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { removeNullProps } from "@helpers/check-obj";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { ColData } from "@models/column-data.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import {
  Lookup,
  LookupType,
  MerchantSale,
  Sale,
  SaleSearchObj,
} from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { BaseResponse } from "@models/response.model";
import { User } from "@models/user.model";
import { CorporateUserService } from "../../corporate-user/corporate-user.service";
import { Country } from "../../countries/country.model";
import { Corporate } from "../../corporates/corporate.model";
import { CountryService } from "../../countries/country.service";
import { CorporateService } from "../../corporates/corporate.service";
import { City } from "../../cities/city.model";
import { CityService } from "../../cities/city.service";
import { CardHolderService } from "@shared/services/card-holder.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";

@Component({
  selector: "app-cardholder-transactions-merchant",
  templateUrl: "./cardholder-transactions-merchant.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardholderTransactionsPerMerchantComponent
  implements OnInit, OnDestroy
{
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  itemsColData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  sales: Sale[];
  salesTotal: MerchantSale;
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  merchants: Lookup[] = [];
  corporateUsers: User[] = [];
  corporate: Corporate;
  cities: City[] = [];
  cityIds: number[] = [];
  merchantIds: number[] = [];
  pageSize = 10;
  cardHolderIds: number[] = [];
  corporateUserId: string = "";
  isRtl: boolean;
  reportName: string;
  userType: string;
  selectedOuIds: number[]=[];
  ouEnabled: boolean;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
    private corporateUserService: CorporateUserService,
    private cardHoldersService: CardHolderService,
    private countryService: CountryService,
    private corporateService: CorporateService,
    private cityService: CityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.ouEnabled = this.authService.isOuEnabled();
    this.getReportName(this.currentLang)
    this.setColData(this.currentLang);
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.setGridData(this.sales);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      }),
      this.reportService.getSelectedOuIds().subscribe((data)=>{
        this.selectedOuIds = data
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.selectedOuIds = this.reportService?.ouIds; 
    this.getCorporate();
    this.getMerchants();
    this.getCardHolders(this.corporateId);
  }

  getReportName(lang: string){
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
    ? `report.${this.reportName}En`
    : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      { field: "transactionUuid", header: "report.transactionItemId" },
      this.ouEnabled && {field:`${lang === "en" ? "ouEnName" : "ouLocaleName"}` , header:"report.ouName"},
      {
        field: `${lang === "en" ? "merchantEnName" : "merchantLocaleName"}`,
        header: `${
          lang === "en" ? "report.merchantEnName" : "report.merchantLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "siteEnName" : "siteLocaleName"}`,
        header: `${
          lang === "en" ? "report.siteEnName" : "report.siteLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "cityEnName" : "cityLocaleName"}`,
        header: `${
          lang === "en" ? "report.cityEnName" : "report.cityLocaleName"
        }`,
      },

      {
        field: `${lang === "en" ? "cardHolderEnName" : "cardHolderLocaleName"}`,
        header: `${
          lang === "en"
            ? "report.cardHolderEnName"
            : "report.cardHolderLocaleName"
        }`,
      },

      {
        field: "cardHolderNfcSerialNumber",
        header: "report.cardHolderNfcSerialNumber",
      },

      {
        field: "netAmount",
        header: "report.netAmount",
      },
      {
        field: "vatAmount",
        header: "report.vatAmount",
      },
      {
        field: "grossAmount",
        header: "report.gross",
      },
      {
        field: "transactionCreationDate",
        header: "report.transactionCreationDate",
      },
    ];

    this.itemsColData = [
      { field: "corporateUserId", header: "report.corporateUserId" },
      { field: "assetNfcSerialNumber", header: "report.assetNfcSerialNumber" },

      {
        field: `${
          lang === "en" ? "productCategoryEnName" : "productCategoryLocaleName"
        }`,
        header: `${
          lang === "en"
            ? "report.productCategoryEnName"
            : "report.productCategoryLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "productEnName" : "productLocaleName"}`,
        header: `${
          lang === "en" ? "report.productEnName" : "report.productLocaleName"
        }`,
      },
      { field: "quantity", header: "report.quantity" },
      { field: "currentMileage", header: "report.currentMileage" },
      { field: "netAmount", header: "report.netAmount" },
      { field: "vatAmount", header: "report.vatAmount" },
      { field: "transactionItemAmount", header: "report.gross" },
    ];
  }

  setGridData(data: Sale[], isExpanded: boolean = false) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);  
      this.gridData = formatedData.map((sale) => {
        let formated_transactionItemReportDtoList = this.reportService.addCommaToNumberValues(sale.transactionItemReportDtoList);
        return {
          [`${
            this.currentLang === "en"
              ? "ouEnName"
              : "ouLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.ouEnName
              : sale.ouLocaleName,
          transactionCreationDate: new Date(
            sale.transactionCreationDate
            ).toLocaleDateString() + " "  +new Date(
              sale.transactionCreationDate
            ).toLocaleTimeString(),
          [`${
            this.currentLang === "en" ? "merchantEnName" : "merchantLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.merchantEnName
              : sale.merchantLocaleName,
          merchantId: sale.merchantId,
          [`${this.currentLang === "en" ? "siteEnName" : "siteLocaleName"}`]:
            this.currentLang === "en" ? sale.siteEnName : sale.siteLocaleName,
          [`${this.currentLang === "en" ? "cityEnName" : "cityLocaleName"}`]:
            this.currentLang === "en" ? sale.cityEnName : sale.cityLocaleName,
          [`${
            this.currentLang === "en"
              ? "cardHolderEnName"
              : "cardHolderLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.cardHolderEnName
              : sale.cardHolderLocaleName,
          corporateUserId: sale.corporateUserId,
          assetNfcSerialNumber: sale.assetNfcSerialNumber,
          transactionUuid: sale.transactionUuid,
          quantity: sale.quantity,
          netAmount: sale.netAmount,
          vatAmount: sale.vatAmount,
          transactionItemAmount: sale.transactionItemAmount,
          cardHolderNfcSerialNumber: sale.cardHolderNfcSerialNumber,
          grossAmount: sale.grossAmount,
          transactionItemReportDtoList: formated_transactionItemReportDtoList,
          isExpanded,
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getSales(searchObj?: SaleSearchObj, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getSales(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (sale: MerchantSale) => {
            if (pageSize) {
              if (sale?.sales?.content.length) {
                this.salesTotal = sale;
                this.totalElements = sale.sales.totalElements;
                this.sales = sale?.sales?.content;
                this.setGridData(this.sales);
              } else {
                this.salesTotal = null;
                this.totalElements = 0;
                this.setGridData(null);
                this.translate
                  .get(["error.noExpensesFound", "type.warning"])
                  .subscribe((res) => {
                    this.toastr.warning(
                      Object.values(res)[0] as string,
                      Object.values(res)[1] as string
                    );
                  });
              }
            } else {
              if (exportType == "excel") {
                if (this.currentLang === "ar") {
                  this.isRtl = true;
                }
                this.setGridData(sale.salesList, true);
                setTimeout(() => {
                  this.excelService.exportAsExcelFile(
                    document.getElementById("printable-sale"),
                    "CardHolderSales",
                    this.isRtl
                  );
                  this.setGridData(this.sales, false);
                }, 1000);
              } else if (exportType == "pdf") {
                this.setGridData(sale.salesList, true);
                setTimeout(() => {
                  this.pdfService.printReport(this.colData, this.gridData ,this.reportName, this.currentLang)
                  this.setGridData(this.sales);
                }, 1000);
              }
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  // get merchants
  getMerchants() {
    
    this.subs.add(
      this.reportService
        .getCorporateLookup(this.corporateId, LookupType.MERCHANT)
        .subscribe(
          (merchants: Lookup[]) => {
            if (merchants.length) {
              this.merchants = merchants;
            } else {
              //this.toastr.warning("No merchants found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCardHolders(corporateId: number) {
    
    this.subs.add(
      this.cardHoldersService.getCardHolders(this.corporateId).subscribe(
        (cardHolders: any) => {
          if (cardHolders.content.length > 0) {
            const userIds = cardHolders.content.map(
              (cardHolder) => cardHolder.corporateUserId
            );
            this.getCorporateUsers(corporateId, { userIds });
          } else {
            //this.toastr.warning("No Card Holders Found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporateUsers(corporateId: number, searchObj?: any) {
    
    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(corporateId, removeNullProps(searchObj))
        .subscribe(
          (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content;
            } else {
              //this.toastr.warning("No corporate users found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.corporate = corporate;
            this.getCountry(corporate.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCountry(countryId: number) {
    
    this.subs.add(
      this.countryService.getCountry(countryId).subscribe(
        (country: Country) => {
          if (country) {
            this.getCities(country.id);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCities(countryId: number) {
    
    this.subs.add(
      this.cityService.getCities(countryId).subscribe(
        (cities: BaseResponse<City>) => {
          if (cities.content) {
            this.cities = cities.content;
          } else {
            //this.toastr.warning("No city found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  searchCardHolderTransaction() {
    this.searchObj = {
      ouIds: this.selectedOuIds,
      ...( this.userType === "admin" && {
        corporateIds:[this.corporateId]
      }),
      cardHolderIds: this.cardHolderIds.length
        ? this.cardHolderIds
        : this["corporateUsers"].map((item) => item.id),
      merchantIds: this.merchantIds.length
        ? this.merchantIds
        : this["merchants"].map((item) => item.id),
      cityIds: this.cityIds.length
        ? this.cityIds
        : this["cities"].map((item) => item.id),
      ...(this.corporateUserId && { corporateUserIds: [this.corporateUserId] }),
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate),1)) : null,
    };
    this.currentPage = 1;
    this.getSales(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getSales(this.searchObj, null, "excel");
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getSales(this.searchObj, this.pageSize);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getSales(this.searchObj, this.pageSize);
  }

  openPDF(): void {
    this.getSales(this.searchObj, null, "pdf");
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
