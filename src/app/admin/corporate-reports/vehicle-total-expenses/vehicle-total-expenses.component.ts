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
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { CorporateVehicle } from "../../corporate-vehicle/corporate-vehicle.model";
import { CorporateVehicleService } from "../../corporate-vehicle/corporate-vehicle.service";
import { ActivatedRoute } from "@angular/router";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { CorporateHardware } from "../../corporate-hardware/corporate-hardware.model";
import { CorporateHardwareService } from "../../corporate-hardware/corporate-hardware.service";
import { CorporateContainer } from "../../corporate-container/corporate-container.model";
import { CorporateContainerService } from "../../corporate-container/corporate-container.service";
import { AssetType } from "@models/asset-type";
import {  Sale, TransactionsReportDto, TransactionsReportsSearchObj } from "@models/reports.model";
import { AuthService } from "app/auth/auth.service";
import {AssetTag} from "@models/asset-tag";
import {AssetTagService} from "@shared/services/asset-tag.service";
@Component({
    selector: "app-vehicle-total-expenses",
    templateUrl: "./vehicle-total-expenses.component.html",
    styleUrls: ["../../../scss/common-sales-style.scss"],
    encapsulation: ViewEncapsulation.Emulated,
  })

export class VehicleTotalExpensesComponent implements OnInit, OnDestroy {
    @ViewChild("reportForm") submitForm: NgForm;
    private subs = new SubSink();
    gridData: any[] = [];
    colData: ColData[] = [];
    currentLang: string;
    corporateId: number;
    fromDate: string;
    toDate: string;
    currentPage: number = 1;
    totalElements: number;
    searchObj: TransactionsReportsSearchObj;
    assetIds: number[] = [];
    corporateVehicles: CorporateVehicle[] = [];
    corporateHardwares: CorporateHardware[] = [];
    corporateContainers: CorporateContainer[] = [];
    isRtl: boolean;
    pageSize = 10;
    reportName: string;
    assetType: string;
    salesTotal: TransactionsReportDto;
    sales: Sale[];
    userType: string;
    selectedOuIds: number[]=[];
    ouEnabled: boolean;
    isAdminCorporateOuEnabled: boolean;
    assetTags: AssetTag[] =[];
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
    ) {}

    ngOnInit(): void {
        this.ouEnabled = this.authService.isOuEnabled();
        this.isAdminCorporateOuEnabled = this.authService.isAdminCorporateOuEnabled();
        this.assetType = this.route.snapshot.data["assetType"];
        this.currentLang = this.currentLangService.getCurrentLang();
        this.userType = this.authService.getUserType();
        this.setColData(this.currentLang)
        this.getReportName(this.currentLang)
        this.subs.add(
          this.route.parent.params.subscribe((params) => {
            this.corporateId = +getRelatedSystemId(params, "corporateId");
          }),
          this.translate.onLangChange.subscribe(({ lang }) => {
            this.currentLang = lang;
            this.getReportName(this.currentLang)
            this.setColData(this.currentLang)
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

    getReportName(lang: string){
        this.reportName = this.route.snapshot.data["reportName"];
        this.reportName = lang === "en"
        ? `report.${this.reportName}En`
        : `report.${this.reportName}Ar`
    }

    setColData(lang: string) {
        this.colData = [
            { field: "transactionUuid", header: "report.transactionItemId" },
            (this.ouEnabled || this.isAdminCorporateOuEnabled) && {field:`${lang === "en" ? "ouEnName" : "ouLocaleName"}` , header:"report.ouName"},
            this.assetType === AssetType.Hardware && {
                field: "assetId",
                header: "report.hardwareId",
            },
            this.assetType === AssetType.Container && {
                field: "assetId",
                header: "report.containerId",
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
              field: `${
                lang === "en" ? "vehicleTypeEnName" : "vehicleTypeLocaleName"
              }`,
              header: `${
                lang === "en"
                  ? "report.vehicleTypeEnName"
                  : "report.vehicleTypeLocaleName"
              }`,
            },
            { field: "vehiclePlateNumber", header: "report.vehiclePlateNumber" },
            { field: "vehicleCode", header: "corporateVehicle.vehicleCode" },
            { field: "mileageReading", header:"report.mileageReading"},
            {
                field: `${lang === "en" ? "siteEnName" : "siteLocaleName"}`,
                header: `${
                  lang === "en" ? "report.siteEnName" : "report.siteLocaleName"
                }`,
            },
            {
                field: `${lang === "en" ? "merchantEnName" : "merchantLocaleName"}`,
                header: `${
                  lang === "en" ? "report.merchantEnName" : "report.merchantLocaleName"
                }`,
            },
            {
                field: `${lang === "en" ? "cityEnName" : "cityLocaleName"}`,
                header: "report.cityName",
            },
            {
                field: "grossAmount",
                header: "report.transactionAmount",
            },
            {
                field: "transactionCreationDate",
                header: "report.transactionDate",
            },
            {
              field: "assetTagName",
              header: "corporateVehicle.assetTag",
            }
        ].filter(Boolean);
      }

      getVehicleTransactionsReport(searchObj?: TransactionsReportsSearchObj, pageSize?: number, exportType?: string){
        this.pageSize = pageSize;
        
        this.subs.add(
          this.reportService
          .getTransactionsReport(
            removeNullProps(searchObj),
            this.currentPage - 1,
            this.pageSize
          )
          .subscribe(
            (transactions: TransactionsReportDto)=>{
              if (pageSize) {
                if (transactions?.transactionsPage?.content.length) {
                  this.salesTotal = transactions
                  this.totalElements = transactions.transactionsPage.totalElements;
                  this.sales = transactions?.transactionsPage?.content;
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
                  this.setGridData(transactions.transactionsList);
                  setTimeout(() => {
                    this.excelService.exportAsExcelFile(
                      document.getElementById("printable-sale"),
                      "Vehicle Total Expenses",
                      this.isRtl
                    );
                    this.setGridData(this.sales);
                    this.pageSize = 10
                  }, 1000);
                } else if (exportType == "pdf") {
                  this.setGridData(transactions.transactionsList);
                  setTimeout(() => {
                    this.pdfService.printReport(
                      this.colData,
                      this.gridData,
                      this.reportName,
                      this.currentLang,
                      { pdfData:[{
                          dataLabel:{
                            groupOneData:[
                              {header:'report.totalNumberOfTransactions',field:`${this.salesTotal.totalNumberOfTransactions}`},
                            ],
                            groupTwoData:[
                              {header:'report.totalTransactionAmount', field:`${this.salesTotal.totalAmountsIncludingVat}`},
                            ],
                          },
                          metaData: {
                            headerTitle: 'app.total'
                          }
                        }] ,
                        pdfComponentsWidth:{
                          titleSizeTwo: 50,
                          tableLabelWidth: 50,
                          tableValueWidth: 50,
                        }}
                      )
                    this.setGridData(this.sales);
                    this.pageSize = 10
                  }, 1000);
                }
              }
              

          })
        );

      }

      setGridData(data) {
        if (data) {
          let formatedData = this.reportService.addCommaToNumberValues(data);
          this.gridData = formatedData.map((sale) => {
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
                sale.creationDate
                ).toLocaleDateString() + " "  +new Date(
                  sale.creationDate
                ).toLocaleTimeString(),
              [`${
                this.currentLang === "en"
                  ? "vehicleTypeEnName"
                  : "vehicleTypeLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.vehicleTypeEnName
                  : sale.vehicleTypeLocaleName,
              vehiclePlateNumber: sale.vehiclePlateNumber,
              vehicleCode: sale.vehicleCode,
              [`${
                this.currentLang === "en"
                  ? "cardHolderEnName"
                  : "cardHolderLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.cardHolderEnName
                  : sale.cardHolderLocaleName,
              [`${this.currentLang === "en" ? "siteEnName" : "siteLocaleName"}`]:
              this.currentLang === "en" ? sale.siteEnName : sale.siteLocaleName,
              [`${this.currentLang === "en" ? "cityEnName" : "cityLocaleName"}`]:
                this.currentLang === "en" ? sale.cityEnName : sale.cityLocaleName,
              [`${
                this.currentLang === "en" ? "merchantEnName" : "merchantLocaleName"
              }`]:
                this.currentLang === "en"
                  ? sale.merchantEnName
                  : sale.merchantLocaleName,
              transactionUuid: this.corporateId !== 68 ? sale.uuid : sale.transactionItemId,
              mileageReading:sale.currentMileage,
              grossAmount: sale.grossAmountIncludingVat,
              assetTagName: this.assetTags.find((tag) => (tag.id+"") === sale.assetTagId)?.enName
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
      this.getVehicleTransactionsReport(this.searchObj,null,"excel")
    }

    openPDF(): void {
      this.getVehicleTransactionsReport(this.searchObj,null,"pdf")
    }

    search() {
        this.searchObj = {
          ...( this.userType === "admin" && {
            corporateIds:[this.corporateId]
          }),
          assetTypes: [this.assetType],
          assetIds: this.assetIds.length
            ? this.assetIds
            : null,
          assetTagIds: this.assetTagIds.length ? this.assetTagIds : null,
          fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
          toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate),1)) : null,
          ouIds: this.selectedOuIds,
        };
        this.currentPage = 1;
        this.getVehicleTransactionsReport(this.searchObj, this.pageSize);
    }

    loadPage(page: number) {
        this.currentPage = page;
        this.getVehicleTransactionsReport(this.searchObj, this.pageSize);
    }

    handlePageSizeChange(pageSize: number) {
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.getVehicleTransactionsReport(this.searchObj, this.pageSize);
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