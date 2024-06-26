import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {NgForm} from "@angular/forms";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ErrorService} from "@shared/services/error.service";
import {ExcelService} from "@shared/services/excel.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {PdfService} from "@shared/services/pdf.service";
import {ReportService} from "@shared/services/report.service";
import {CorporateVehicle} from "../../corporate-vehicle/corporate-vehicle.model";
import {CorporateVehicleService} from "../../corporate-vehicle/corporate-vehicle.service";
import {ActivatedRoute} from "@angular/router";
import {addMonths, fixTimeZone} from "@helpers/timezone.module";
import {CorporateHardware} from "../../corporate-hardware/corporate-hardware.model";
import {CorporateHardwareService} from "../../corporate-hardware/corporate-hardware.service";
import {CorporateContainer} from "../../corporate-container/corporate-container.model";
import {CorporateContainerService} from "../../corporate-container/corporate-container.service";
import {AssetType} from "@models/asset-type";
import {AdminSearchObj, VehicleReport} from "@models/reports.model";
import {AuthService} from "app/auth/auth.service";
import {AssetTag} from "@models/asset-tag";
import {AssetTagService} from "@shared/services/asset-tag.service";

@Component({
  selector: "app-vehicle-consumption-details",
  templateUrl: "./vehicle-consumption-details.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})

export class VehicleConsumptionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  searchObj: AdminSearchObj;
  fromDate: string;
  toDate: string;
  totalElements: number;
  assetIds: number[] = [];
  corporateVehicles: CorporateVehicle[] = [];
  corporateHardwares: CorporateHardware[] = [];
  corporateContainers: CorporateContainer[] = [];
  isRtl: boolean;
  reportName: string;
  assetType: string;
  corporateVehicleConsumptions: VehicleReport[] = [];
  userType: string;
  selectedOuIds: number[] = [];
  ouEnabled: boolean;
  assetTags: AssetTag[] = [];
  assetTagIds: number[] = [];

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private corporateVehicleService: CorporateVehicleService,
    private route: ActivatedRoute,
    private corporateHardwareService: CorporateHardwareService,
    private corporateContainerService: CorporateContainerService,
    private authService: AuthService,
    private assetTagService: AssetTagService
  ) {
  }

  ngOnInit(): void {
    this.ouEnabled = this.authService.isOuEnabled();
    this.assetType = this.route.snapshot.data["assetType"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.setColData(this.currentLang)
    this.getReportName(this.currentLang)
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang)
        this.setGridData(this.corporateVehicleConsumptions);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      }),
      this.reportService.getSelectedOuIds().subscribe((data) => {
        this.selectedOuIds = data
      })
    );
    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.selectedOuIds = this.reportService?.ouIds;

    if (this.corporateId && this.assetType === AssetType.Vehicle) {
      this.getCorporateVehicles(this.corporateId);
    }
    if (this.corporateId && this.assetType === AssetType.Hardware) {
      this.getCorporateHardwares(this.corporateId);
    }
    if (this.corporateId && this.assetType === AssetType.Container) {
      this.getCorporateContainers(this.corporateId);
    }
    this.getAssetTags();
  }

  getReportName(lang: string) {
    this.reportName = this.route.snapshot.data["reportName"];
    this.reportName = lang === "en"
      ? `report.${this.reportName}En`
      : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    this.colData = [
      {
        field: `${
          lang === "en" ? "vehicleTypeEnName" : "vehicleTypeLocaleName"
        }`,
        header: `${
          lang === "en"
            ? "report.vehicleTypeEnName"
            : "report.vehicleTypeLocaleName"
        }`,
      },
      {field: "vehiclePlateNumber", header: "report.vehiclePlateNumber"},
      (this.ouEnabled || this.userType === 'admin') && {
        field: `${lang === "en" ? "ouEnName" : "ouLocaleName"}`,
        header: "report.ouName"
      },
      {
        field: "totalMileage",
        header: "report.numberOfKM",
      },
      {
        field: "totalTransactionsAmount",
        header: "report.transactionAmount",
      },
      {
        field: "totalNumberOfFuelLiters",
        header: "report.totalNumberOfFuelLiters",
      },
      {
        field: "totalMaintenanceConsumption",
        header: "report.totalMaintenanceConsumption",
      },
      {
        field: "totalOilChangeConsumption",
        header: "report.totalOilChangeConsumption",
      },
      {
        field: "totalNumberOfTransactions",
        header: "report.totalNumberOfTransactions",
      },
      {
        field: "averageFuelTransactionAmount",
        header: "report.averageFuelTransactionAmount",
      },
      {
        field: "lastReadingMileage",
        header: "report.lastReadingMileage",
      },
      {
        field: "averageFuelConsumptionRate",
        header: "report.averageFuelConsumptionRate",
      },
      {
        field: "totalNumberOfAlerts",
        header: "report.totalNumberOfAlerts",
      },
      {
        field: "tankSize",
        header: "report.tankSize",
      },
      {
        field: "consumptionDefaultRate",
        header: "report.consumptionDefaultRate",
      },
      {
        field: "vehicleCode",
        header: "corporateVehicle.vehicleCode",
      },
      {
        field: "fuelOverConsumptionLiters",
        header: "alert.fuelOverConsumptionLiters",
      },
      {
        field: "brand",
        header: "corporateVehicle.brand",
      },
      {
        field: "periodFirstReadingMileage",
        header: "corporateVehicle.periodFirstReadingMileage",
      },
      {
        field: "periodLastReadingMileage",
        header: "corporateVehicle.periodLastReadingMileage",
      },
      {
        field: "assetTagName",
        header: "corporateVehicle.assetTag",
      }
    ].filter(Boolean);
  }

  getVehicleConsumptionReport(searchObj?: AdminSearchObj) {
    
    this.subs.add(
      this.reportService
        .getCorporateVehicleDetails(
          this.corporateId,
          removeNullProps(searchObj)
        )
        .subscribe(
          (data: VehicleReport[]) => {
            if (data?.length > 0) {
              this.totalElements = data.length;
              this.corporateVehicleConsumptions = data;
              this.setGridData(this.corporateVehicleConsumptions);
            } else {
              this.totalElements = null;
              this.setGridData([]);
              this.translate
                .get(["error.noDataFound", "type.warning"])
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

  setGridData(data) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      this.gridData = formatedData.map((sale: VehicleReport) => {
        return {
          [`${
            this.currentLang === "en"
              ? "ouEnName"
              : "ouLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.ouEnName
              : sale.ouLocaleName,
          [`${
            this.currentLang === "en"
              ? "vehicleTypeEnName"
              : "vehicleTypeLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.vehicleTypeEnName
              : sale.vehicleTypeLocaleName,
          vehiclePlateNumber: sale.plateNumber,
          totalMileage: sale.totalMileage,
          totalTransactionsAmount: sale.totalTransactionsAmount,
          totalNumberOfFuelLiters: sale.numberOfFuelLiters,
          totalMaintenanceConsumption: sale.totalMaintenanceConsumption,
          totalOilChangeConsumption: sale.totalOilChangeConsumption,
          totalNumberOfTransactions: sale.totalNumberOfTransactions,
          averageFuelTransactionAmount: sale.averageFuelTransactionAmount,
          lastReadingMileage: sale.lastReadingMileage,
          averageFuelConsumptionRate: sale.averageFuelConsumptionRate,
          totalNumberOfAlerts: sale.totalNumberOfAlerts,
          tankSize: sale.tankSize,
          consumptionDefaultRate: sale.consumptionDefaultRate,
          vehicleCode: sale.vehicleCode,
          fuelOverConsumptionLiters: sale.fuelOverConsumptionLiters,
          brand: sale.brand,
          periodFirstReadingMileage: sale.periodFirstReadingMileage,
          periodLastReadingMileage: sale.periodLastReadingMileage,
          assetTagName: this.assetTags.find((tag) => (tag.id+"") === (sale.assetTagId+""))?.enName
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getCorporateVehicles(corporateId: number) {
    
    this.subs.add(
      this.corporateVehicleService.getCorporateVehicles(corporateId).subscribe(
        (corporateVehicles: BaseResponse<CorporateVehicle>) => {
          if (corporateVehicles.content?.length > 0) {
            this.corporateVehicles = corporateVehicles.content;
          } else {
            this.translate.get(["error.noVehiclesFound", "type.warning"]).subscribe(
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

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  exportAsXLSX(): void {
    if (this.currentLang === "ar") {
      this.isRtl = true;
    }
    this.excelService.exportAsExcelFile(
      document.getElementById("printable-sale"),
      `${this.currentLang == "en" ? "Vehicle Consumption Details" : "تفاصيل استهلاك المركبات"}`,
      this.isRtl
    );
  }

  openPDF(): void {
    this.pdfService.printReport(this.colData, this.gridData, this.reportName, this.currentLang)
  }

  search() {
    this.searchObj = {
      ...(this.userType === "admin" && {
        corporateIds: [this.corporateId]
      }),
      assetTypes: [this.assetType],
      assetIds: this.assetIds.length
        ? this.assetIds
        : null,
      assetTagIds: this.assetTagIds.length ? this.assetTagIds : null,
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addMonths(Date.parse(this.toDate), 1)) : null,
      ouIds: this.selectedOuIds,
    };
    this.getVehicleConsumptionReport(this.searchObj);
  }

  getAssetTags() {
    
    this.subs.add(
      this.assetTagService.getAssetTags(this.corporateId).subscribe(
        (assetTags: BaseResponse<AssetTag>) => {
          if (assetTags.content?.length > 0) {
            this.assetTags = assetTags.content;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}