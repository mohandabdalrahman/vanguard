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
  SaleSearchObj,
  SalesGroup,
  TotalSales,
  TotalsGroup,
} from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { AssetType } from "@models/asset-type";
import { BaseResponse } from "@models/response.model";
import { CorporateHardware } from "../../corporate-hardware/corporate-hardware.model";
import { CorporateHardwareService } from "../../corporate-hardware/corporate-hardware.service";
import { City } from "../../cities/city.model";
import { CountryService } from "../../countries/country.service";
import { CorporateService } from "../../corporates/corporate.service";
import { CityService } from "../../cities/city.service";
import { Country } from "../../countries/country.model";
import { CorporateVehicle } from "../../corporate-vehicle/corporate-vehicle.model";
import { CorporateVehicleService } from "../../corporate-vehicle/corporate-vehicle.service";
import { CorporateContainer } from "../../corporate-container/corporate-container.model";
import { CorporateContainerService } from "../../corporate-container/corporate-container.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { AuthService } from "app/auth/auth.service";

@Component({
  selector: "app-txn-amount",
  templateUrl: "./txn-amount.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TxnAmountComponent implements OnInit, OnDestroy {
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
  assetType: AssetType;
  corporateHardwares: CorporateHardware[] = [];
  corporateVehicles: CorporateVehicle[] = [];
  corporateContainers: CorporateContainer[] = [];
  assetIds: number[] = [];
  cities: City[] = [];
  cityIds: number[] = [];
  isRtl: boolean;
  reportName: string;
  userType: string;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
    private corporateHardwareService: CorporateHardwareService,
    private countryService: CountryService,
    private corporateService: CorporateService,
    private cityService: CityService,
    private corporateVehicleService: CorporateVehicleService,
    private corporateContainerService: CorporateContainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.assetType = this.route.snapshot.data["assetType"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.getReportName(this.currentLang)
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
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;

    if (this.corporateId) {
      this.getCorporate();
      if (this.assetType === AssetType.Hardware) {
        this.getCorporateHardwares(this.corporateId);
      } else if (this.assetType === AssetType.Vehicle) {
        this.getCorporateVehicles(this.corporateId);
      } else if (this.assetType === AssetType.Container) {
        this.getCorporateContainers(this.corporateId);
      }
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
      {
        field: `${lang === "en" ? "groupByEn" : "groupByLocale"}`,
        header: `${lang === "en" ? "city.enName" : "city.localeName"}`,
      },
      {
        field: "totalNumberOfTransactionItems",
        header: "report.totalNumberOfTransactionItems",
      },
      { field: "totalSales", header: "report.totalSales" },
      { field: "totalProductsVat", header: "report.totalProductsVat" },
      {
        field: "totalSalesIncludingVat",
        header: "report.totalSalesIncludingVat",
      },
      {
        field: "totalNumberOfCardHolders",
        header: "report.totalNumberOfCardHolders",
      },
      {
        field: "totalNumberOfVehicles",
        header: "report.totalNumberOfVehicles",
      },
      {
        field: "totalNumberOfProducts",
        header: "report.totalNumberOfProducts",
      },
    ];
  }

  setGridData(data: TotalsGroup[]) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      this.gridData = formatedData.map((sale) => {
        return {
          [`${this.currentLang === "en" ? "groupByEn" : "groupByLocale"}`]:
            this.currentLang === "en" ? sale.groupByEn : sale.groupByLocale,
          totalNumberOfTransactionItems: sale.totalNumberOfTransactionItems,
          totalSales: sale.totalSales,
          totalProductsVat: sale.totalProductsVat,
          totalSalesIncludingVat: sale.totalSalesIncludingVat,
          totalNumberOfCardHolders: sale.totalNumberOfCardHolders,
          totalNumberOfVehicles: sale.totalNumberOfVehicles,
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
        .getTotalSales(SalesGroup.CITY_ID, removeNullProps(searchObj))
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

  getCorporateHardwares(corporateId: number) {
    
    this.subs.add(
      this.corporateHardwareService
        .getCorporateHardwares(corporateId)
        .subscribe(
          (corporateHardwares: BaseResponse<CorporateHardware>) => {
            if (corporateHardwares.content?.length > 0) {
              this.corporateHardwares = corporateHardwares.content;
            } else {
              //this.toastr.warning("No corporate hardwares found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateVehicles(corporateId: number) {
    
    this.subs.add(
      this.corporateVehicleService.getCorporateVehicles(corporateId).subscribe(
        (corporateVehicles: BaseResponse<CorporateVehicle>) => {
          if (corporateVehicles.content?.length > 0) {
            this.corporateVehicles = corporateVehicles.content;
          } else {
            //this.toastr.warning("No corporate vehicles found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporateContainers(corporateId: number) {
    
    this.subs.add(
      this.corporateContainerService
        .getCorporateContainers(corporateId)
        .subscribe(
          (corporateContainers: BaseResponse<CorporateContainer>) => {
            if (corporateContainers.content?.length > 0) {
              this.corporateContainers = corporateContainers.content;
            } else {
              //this.toastr.warning("No corporate containers found");
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

  searchCity() {
    this.searchObj = {
      ...( this.userType === "admin" && {
        corporateIds:[this.corporateId]
      }),
      cityIds: this.cityIds.length
        ? this.cityIds
        : this["cities"].map((item) => item.id),
      // assetIds: this.assetIds.length ? this.assetIds : this['corporateVehicles'].map((item) => item.id),
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
    };
    this.getTotalSales(this.searchObj);
  }

  exportAsXLSX(): void {
    if (this.currentLang === "ar") {
      this.isRtl = true;
    }
    this.excelService.exportAsExcelFile(
      document.getElementById("printable-sale"),
      `${this.assetType}_Transaction_city}`,
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
