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
import { BaseResponse } from "@models/response.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { City } from "../../admin/cities/city.model";
import { CityService } from "../../admin/cities/city.service";
import {
  Lookup,
  LookupType,
  SaleSearchObj,
  SalesGroup,
  TotalSales,
  TotalsGroup,
} from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { Country } from "../../admin/countries/country.model";
import { CorporateService } from "../../admin/corporates/corporate.service";
import { CountryService } from "../../admin/countries/country.service";
import { ActivatedRoute } from "@angular/router";
import { Zone } from "../../admin/zones/zone.model";
import { ZoneService } from "../../admin/zones/zone.service";
import {
  Corporate,
  CorporateSearch,
} from "../../admin/corporates/corporate.model";
import { Merchant } from "../../admin/merchants/merchant.model";
import { MerchantService } from "../../admin/merchants/merchant.service";
import { ProductCategory } from "../../admin/product/product-category.model";
import { ProductCategoryService } from "../../admin/product/productCategory.service";
import { AuthService } from "app/auth/auth.service";

@Component({
  selector: "app-total-txn-amount",
  templateUrl: "./total-txn-amount.component.html",
  styleUrls: ["../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TotalTxnAmountComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  totalGroup: TotalsGroup[];
  merchantTotal: TotalSales;
  searchObj;
  cities: City[] = [];
  cityIds: number[] = [];
  merchantIds: number[] = [];
  salesGroup: SalesGroup;
  sites: Lookup[] = [];
  merchantsCorporate: Lookup[] = [];
  siteIds: number[] = [];
  zoneIds: number[] = [];
  corporateIds: number[] = [];
  zones: Zone[] = [];
  countryId: number;
  isRtl: boolean;
  corporates: Corporate[] = [];
  merchants: Merchant[] = [];
  productCategories: ProductCategory[] = [];
  productCategoryId: number = null;
  userType: string;
  selectedCorporateId: number;
  removeAdditionalTotals = false;
  relatedSystemIds: string;
  suspended = true;
  reportName: string;
  reportTitle: string;
  selectedOuIds: number[]=[];

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private cityService: CityService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private corporateService: CorporateService,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private zoneService: ZoneService,
    private merchantService: MerchantService,
    private productService: ProductCategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reportTitle = this.route.snapshot.data["reportName"];
    this.userType = this.authService.getUserType();
    this.salesGroup = this.route.snapshot.data["salesGroup"];
    this.removeAdditionalTotals =
      this.route.snapshot.data["removeAdditionalTotals"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.getReportName(this.currentLang)
    this.relatedSystemIds = sessionStorage.getItem("relatedSystemIds");
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.setGridData(this.totalGroup);
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
    if (
      (this.salesGroup === SalesGroup.CITY_ID &&
        this.userType === "corporate") ||
      this.salesGroup === SalesGroup.ZONE_ID
    ) {
      this.getCorporate(this.corporateId);
    }
    if (this.salesGroup === SalesGroup.SITE_ID) {
      this.getSites();
    }
    if (
      this.salesGroup === SalesGroup.MERCHANT_ID &&
      this.userType === "corporate"
    ) {
      this.getMerchantsCorporate(this.corporateId);
    }
    if (
      this.salesGroup === SalesGroup.MERCHANT_ID &&
      this.userType === "admin"
    ) {
      this.getMerchants();
    }
    if (
      this.salesGroup === SalesGroup.CORPORATE_ID ||
      ((this.salesGroup === SalesGroup.MERCHANT_ID ||
        this.salesGroup === SalesGroup.CITY_ID) &&
        (this.userType === "admin" || this.userType === "master_corporate"))
    ) {
      this.getCorporates({
        ids: this.relatedSystemIds
          ? this.relatedSystemIds?.split(",")?.map(Number)
          : null,
        suspended: !this.suspended,
      });
    }
    if (this.salesGroup === SalesGroup.CORPORATE_ID) {
      this.getProductCategories();
    }
  }

  getReportName(lang: string){
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
    ? `report.${this.reportName}En`
    : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      this.salesGroup === SalesGroup.CITY_ID && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: `${lang === "en" ? "city.enName" : "city.localeName"}`,
      },
      this.salesGroup === SalesGroup.SITE_ID && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: `${lang === "en" ? "site.enName" : "site.localeName"}`,
      },
      this.salesGroup === SalesGroup.MERCHANT_ID && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: "merchant.merchantName",
      },
      this.salesGroup === SalesGroup.ZONE_ID && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: `${lang === "en" ? "zone.enName" : "zone.localeName"}`,
      },
      this.salesGroup === SalesGroup.CORPORATE_ID && {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: `${lang === "en" ? "product.enName" : "product.localeName"}`,
      },
      {
        field: "totalNumberOfTransactionItems",
        header:
          this.salesGroup === SalesGroup.CITY_ID
            ? "report.transactionItems"
            : "report.totalNumberOfTransactionItems",
      },

      this.salesGroup === SalesGroup.CITY_ID && {
        field: "totalNumberOfTransactions",
        header: "report.totalNumberOfTransactionItems",
      },
      { field: "totalSales", header: "report.totalNet" },
      { field: "totalProductsVat", header: "report.totalVat" },
      {
        field: "totalSalesIncludingVat",
        header: "report.totalGross",
      },
      this.salesGroup === SalesGroup.CORPORATE_ID && {
        field: "totalQuantity",
        header: "report.totalQuantity",
      },
      !this.removeAdditionalTotals && {
        field: "totalNumberOfCardHolders",
        header: "report.totalNumberOfCardHolders",
      },
      !this.removeAdditionalTotals && {
        field: "totalNumberOfVehicles",
        header: "report.totalNumberOfVehicles",
      },
      !this.removeAdditionalTotals && {
        field: "totalNumberOfHardware",
        header: "report.totalNumberOfHardware",
      },
      !this.removeAdditionalTotals && {
        field: "totalNumberOfContainers",
        header: "report.totalNumberOfContainers",
      },
      // (this.salesGroup !== SalesGroup.ZONE_ID && {field: "totalNumberOfProducts", header: "report.totalNumberOfProducts"}
      // ),
    ].filter(Boolean);
  }

  setGridData(data: TotalsGroup[]) {
    if (data) {
      this.gridData = data.map((sale) => {
        return {
          [`${this.currentLang === "en" ? "groupByEn" : "groupByLocale"}`]:
            this.currentLang === "en" ? sale.groupByEn : sale.groupByLocale,
          totalNumberOfTransactionItems: sale.totalNumberOfTransactionItems,
          totalNumberOfTransactions: sale.totalNumberOfTransactions,
          totalSales: sale.totalSales,
          totalProductsVat: sale.totalProductsVat,
          totalSalesIncludingVat: sale.totalSalesIncludingVat,
          totalQuantity: sale.totalQuantity,
          ...(!this.removeAdditionalTotals && {
          totalNumberOfCardHolders: sale.totalNumberOfCardHolders,
          }),
          ...(!this.removeAdditionalTotals && {
          totalNumberOfVehicles: sale.totalNumberOfVehicles,
          }),
          ...(!this.removeAdditionalTotals && {
          totalNumberOfHardware: sale.totalNumberOfHardware,
          }),
          ...(!this.removeAdditionalTotals && {
          totalNumberOfContainers: sale.totalNumberOfContainers,
          }),
          totalNumberOfProducts: sale.totalNumberOfProducts,
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getTotalSales(searchObj?: SaleSearchObj) {
    
    this.subs.add(
      this.reportService
        .getTotalSales(SalesGroup[this.salesGroup], removeNullProps(searchObj))
        .subscribe(
          (total: TotalSales) => {
            if (total?.totalsGroups?.length) {
              this.merchantTotal = total;
              this.totalGroup = total?.totalsGroups;
              this.setGridData(this.totalGroup);
            } else {
              this.merchantTotal = null;
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
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporates(searchObj?: CorporateSearch) {
    
    this.subs.add(
      this.corporateService.getCorporates(removeNullProps(searchObj)).subscribe(
        (corporates: BaseResponse<Corporate>) => {
          if (corporates.content?.length > 0) {
            this.corporates = corporates.content;
            if (this.salesGroup === SalesGroup.CITY_ID) {
              this.getCountry(this.corporates[0].countryId);
            }
          } else {
            this.corporates = [];
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
  }

  getMerchants() {
    
    this.subs.add(
      this.merchantService.getMerchants().subscribe(
        (merchants: BaseResponse<Merchant>) => {
          if (merchants.content?.length > 0) {
            this.merchants = merchants.content;
          } else {
            this.toastr.warning("No Merchants found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporate(corporateId: number): void {
    
    this.subs.add(
      this.corporateService.getCorporate(corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.countryId = corporate.countryId;
            this.getCountry(corporate.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  selectCorporate(corporateId: number) {
    if (!corporateId) return;
    if (
      this.salesGroup === SalesGroup.MERCHANT_ID &&
      this.userType === "master_corporate"
    ) {
      this.getMerchantsCorporate(corporateId);
    }
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

  getProductCategories() {
    
    this.subs.add(
      this.productService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
          } else {
            //this.toastr.warning("No Products found");
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

  // get zones
  getZones(countryId: number, cityId: number[]) {
    if (countryId && cityId) {
      
      this.subs.add(
        this.zoneService
          .getZones({ citiesIds: this.cityIds , countryId })
          .subscribe(
            (zones) => {
              if (zones.content?.length > 0) {
                this.zones = zones.content;
              } else {
                this.zones = [];
                //this.toastr.warning("No zones found");
              }
              
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      console.error("no countryId or cityId provided");
    }
  }

  getMerchantsCorporate(corporateId: number) {
    
    this.subs.add(
      this.reportService
        .getCorporateLookup(corporateId, LookupType.MERCHANT)
        .subscribe(
          (merchants: Lookup[]) => {
            if (merchants.length) {
              this.merchantsCorporate = merchants;
            } else {
              this.merchantsCorporate = [];
              this.translate
                .get(["error.noMerchantsFound", "type.warning"])
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

  // get sites
  getSites() {
    
    this.subs.add(
      this.reportService
        .getCorporateLookup(this.corporateId, LookupType.SITE)
        .subscribe(
          (sites: Lookup[]) => {
            if (sites.length) {
              this.sites = sites;
            } else {
              //this.toastr.warning("No sites found");
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

  search() {
    this.searchObj = {
      ...((this.salesGroup === SalesGroup.CITY_ID ||
        this.salesGroup === SalesGroup.ZONE_ID) && {
        cityIds: this.cityIds.length
          ? this.cityIds
          : this["cities"].map((item) => item.id),
      }),
      ...(this.salesGroup === SalesGroup.SITE_ID && {
        siteIds: this.siteIds.length
          ? this.siteIds
          : this["sites"].map((item) => item.id),
      }),
      ...(this.salesGroup === SalesGroup.MERCHANT_ID && {
        merchantIds: this.merchantIds.length
          ? this.merchantIds
          : this["merchantsCorporate"].map((item) => item.id),
      }),
      ...((this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID ||
        this.salesGroup === SalesGroup.CORPORATE_ID) && {
        corporateIds: this.corporateIds.length
          ? this.corporateIds
          : this["corporates"].map((item) => item.id),
      }),
      ...((this.salesGroup === SalesGroup.MERCHANT_ID ||
        this.salesGroup === SalesGroup.CITY_ID) &&
        (this.userType === "admin" || this.userType === "master_corporate") && {
          corporateIds: this.selectedCorporateId
            ? [this.selectedCorporateId]
            : this["corporates"].map((item) => item.id),
        }),
      ...((this.salesGroup === SalesGroup.PRODUCT_CATEGORY_ID ||
        this.salesGroup === SalesGroup.CORPORATE_ID) && {
        productCategoryIds: this.productCategoryId
          ? [this.productCategoryId]
          : this["productCategories"].map((item) => item.id),
      }),
      ...(this.salesGroup === SalesGroup.ZONE_ID && {
        zoneIds: this.zoneIds.length
          ? this.zoneIds
          : this["zones"].map((item) => item.id),
      }),
      fromDate: this.fromDate ? new Date(this.fromDate).getTime() : null,
      toDate: this.toDate ? new Date(this.toDate).getTime() : null,
      ouIds: this.selectedOuIds,
    };
    this.getTotalSales(this.searchObj);
  }

  fetchCorporates() {
    this.selectedCorporateId =
    this.merchantIds =
    this.cityIds =
    this.corporateIds =
    this.productCategoryId = null
    this.getCorporates({
      ids: this.relatedSystemIds
        ? this.relatedSystemIds?.split(",")?.map(Number)
        : null,
      suspended: this.suspended,
    });
  }

  exportAsXLSX(): void {
    if (this.currentLang === "ar") {
      this.isRtl = true;
    }
    this.excelService.exportAsExcelFile(
      document.getElementById("printable-sale"),
      `Total_Transaction_${this.salesGroup}`,
      this.isRtl
    );
  }

  openPDF(): void {
    this.pdfService.printReport(this.colData, this.gridData ,this.reportName, this.currentLang)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
