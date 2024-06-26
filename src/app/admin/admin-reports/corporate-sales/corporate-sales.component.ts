import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { ColData } from "@models/column-data.model";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ErrorService } from "@shared/services/error.service";
import { ExcelService } from "@shared/services/excel.service";

import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { ActivatedRoute } from "@angular/router";
import { BaseResponse } from "@models/response.model";
import { CorporateService } from "../../corporates/corporate.service";
import { Corporate, CorporateSearch } from "../../corporates/corporate.model";
import { ReportName } from "../report-name.model";
import { ProductCategory } from "../../product/product-category.model";
import { ProductCategoryService } from "app/admin/product/productCategory.service";
import {
  AdminSearchObj,
  CorporateCommission,
  CorporateDetailedSales,
  Lookup,
  LookupType,
  ManagementReport,
  ManagementSearchObj,
  ProductCategoryDetailedSales,
  ProductCategoryPolicyBudget,
  VehicleReport,
} from "@models/reports.model";
import { removeNullProps } from "@helpers/check-obj";
import {
  CorporateVehicle,
  FuelType,
  VehicleType,
} from "../../corporate-vehicle/corporate-vehicle.model";
import { CorporateVehicleService } from "../../corporate-vehicle/corporate-vehicle.service";
import { CellData } from "@models/cell-data.model";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { addDays, fixTimeZone } from "@helpers/timezone.module";

@Component({
  selector: "app-corporate-sales",
  templateUrl: "./corporate-sales.component.html",
  styleUrls: [
    "../../../scss/common-sales-style.scss",
    "./corporate-sales.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CorporateSalesComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  @ViewChild("reportDataModal") private reportDataModal: ModalComponent;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  itemsColData: ColData[] = [];
  currentLang: string;
  fromDate: string;
  toDate: string;
  searchObj: AdminSearchObj;
  isRtl: boolean;
  corporates: Corporate[] = [];
  corporateIds: number[] = [];
  corporateId: number;
  selectedCorporateId: number;
  reportName: ReportName;
  productCategoryId: number = null;
  productCategoryIds: number[] = [];
  productCategories: ProductCategory[] = [];
  productCategoryPolicyBudgets: ProductCategoryPolicyBudget[] = [];
  ProductCategoryDetailedSales: ProductCategoryDetailedSales[] = [];
  corporateCommissionDetails: CorporateCommission[] = [];
  corporateDetailedSales: CorporateDetailedSales[] = [];
  corporateVehicleConsumptions: VehicleReport[] = [];
  managmentReportData: ManagementReport[]= [];
  commissionRate: number = null;
  plateNumber: number = null;
  assetIds: number[] = [];
  vehicleTypes: VehicleType[] = [];
  vehicleTypeIds: number[] = [];
  resultLength: number;
  cellData: CellData;
  dataModal: Lookup[] = [];
  relatedSystemIds: string;
  corporateVehicles: CorporateVehicle[] = [];
  fuelTypes: FuelType[] = Object.keys(FuelType).map((key) => FuelType[key]);
  suspended = true;
  reportTitle: string;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  isExportExcel = false;
  oldContent

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
    private corporateService: CorporateService,
    private productService: ProductCategoryService,
    private corporateVehicleService: CorporateVehicleService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.reportName = this.route.snapshot.data["reportName"];
    this.relatedSystemIds = sessionStorage.getItem("relatedSystemIds");
    this.getReportName(this.currentLang)
    this.setColData(this.currentLang);
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        switch (this.reportName) {
          case ReportName.MANAGEMENT_REPORT: {
            this.setGridData(this.managmentReportData);
            break;
          }
          case ReportName.PRODUCT_CATEGORY_CONSUMPTION: {
            this.setGridData(this.ProductCategoryDetailedSales);
            break;
          }
          case ReportName.PRODUCT_CATEGORY_BUDGET_POLICY: {
            this.setGridData(this.productCategoryPolicyBudgets);
            break;
          }
          case ReportName.CORPORATE_SALES: {
            this.setGridData(this.corporateDetailedSales);
            break;
          }
          case ReportName.COMMISSION_BY_CORPORATE: {
            this.setGridData(this.corporateCommissionDetails);
            break;
          }
          case ReportName.CORPORATE_VEHICLE_CONSUMPTION: {
            this.setGridData(this.corporateVehicleConsumptions);
            break;
          }
          case ReportName.CORPORATE_VEHICLE_DETAILS: {
            this.setGridData(this.corporateVehicleConsumptions);
            break;
          }
        }
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      })
    );

    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.getCorporates({
      ids: this.relatedSystemIds
        ? this.relatedSystemIds?.split(",")?.map(Number)
        : null,
      suspended: !this.suspended,
    });
    if (
      this.reportName === ReportName.PRODUCT_CATEGORY_BUDGET_POLICY ||
      ReportName.PRODUCT_CATEGORY_CONSUMPTION
    ) {
      this.getProductCategories();
    }
    if (this.reportName === ReportName.CORPORATE_VEHICLE_CONSUMPTION) {
      this.getVehicleTypes();
    }
  }

  getReportName(lang: string){
    this.reportTitle = this.route.snapshot.data["reportName"];
    this.reportTitle = lang === "en"
    ? `report.${this.reportName}En`
    : `report.${this.reportName}Ar`
  }

  setColData(lang: string) {
    switch (this.reportName) {
      case ReportName.MANAGEMENT_REPORT: {
        this.colData = [
          {
            field: `${
              lang === "en" ? "corporateEnName" : "corporateLocaleName"
            }`,
            header: `${
              lang === "en" ? "corporates.enName" : "corporates.localeName"
            }`,
          },
          {
            field: `${
              lang === "en" ? "merchantEnName" : "merchantLocaleName"
            }`,
            header: `${
              lang === "en" ? "merchant.enName" : "merchant.localeName"
            }`,
          },
          {
            field: `${
              lang === "en" ? "siteEnName" : "siteLocaleName"
            }`,
            header: `${
              lang === "en" ? "report.siteEnName" : "report.siteLocaleName"
            }`,
          },
          {
            field: `${
              lang === "en" ? "productEnName" : "productLocaleName"
            }`,
            header: `${
              lang === "en" ? "product.enName" : "product.localeName"
            }`,
          },
          {
            field:"transactionsCommissionAmount",
            header:"report.comissionAmount"
          },
          {
            field:"transactionsAmount",
            header: "report.totalNet"
          },
          {
            field: "totalQuantity",
            header: "report.totalQuantity",
          },
          {
            field:"transactionsDate",
            header:"report.transactionDate"
          },
        ]
        break;
      }
      case ReportName.PRODUCT_CATEGORY_BUDGET_POLICY: {
        this.colData = [
          {
            field: `${
              lang === "en" ? "corporateEnName" : "corporateLocaleName"
            }`,
            header: `${
              lang === "en" ? "corporates.enName" : "corporates.localeName"
            }`,
          },
          {
            field: `${lang === "en" ? "policyEnName" : "policyLocaleName"}`,
            header: `${
              lang === "en" ? "report.policyEnName" : "report.policyLocaleName"
            }`,
          },
          {
            field: "policyCycleType",
            header: "report.policyCycleType",
          },
          {
            field: "numberOfCycles",
            header: "report.numberOfCycles",
          },
          {
            field: `${
              lang === "en"
                ? "productCategoryEnName"
                : "productCategoryLocaleName"
            }`,
            header: `${
              lang === "en"
                ? "report.productCategoryEnName"
                : "report.productCategoryLocaleName"
            }`,
          },
          {
            field: "numberOfAssignedCardholders",
            header: "report.numberOfAssignedCardholders",
          },
          {
            field: "numberOfAssignedVehicles",
            header: "report.numberOfAssignedVehicles",
          },
          {
            field: "allocatedBudget",
            header: "report.allocatedBudget",
          },
        ];
        break;
      }
      case ReportName.PRODUCT_CATEGORY_CONSUMPTION: {
        this.colData = [
          {
            field: `${
              lang === "en"
                ? "productCategoryEnName"
                : "productCategoryLocaleName"
            }`,
            header: "report.productCategoryName",
          },
          {
            field: "totalNumberOfTransactions",
            header: "report.totalNumberOfTransactions",
          },
          {
            field: "totalNet",
            header: "report.totalNet",
          },
          {
            field: "totalVat",
            header: "report.totalVat",
          },
          {
            field: "totalGross",
            header: "report.totalGross",
          },
          {
            field: "totalNumberOfSites",
            header: "report.totalSitesAvailability",
          },
          {
            field: "totalNumberOfMerchants",
            header: "report.totalMerchantsAvailability",
          },
          {
            field: "totalNumberOfVehicles",
            header: "report.totalVehicleUsage",
          },
        ];
        break;
      }
      case ReportName.COMMISSION_BY_CORPORATE: {
        this.colData = [
          {
            field: `${
              lang === "en" ? "corporateEnName" : "corporateLocaleName"
            }`,
            header: `${
              lang === "en" ? "corporates.enName" : "corporates.localeName"
            }`,
          },
          {
            field: "numberOfTopUps",
            header: "report.numberOfTopUps",
          },
          {
            field: "totalAmountOfTopUps",
            header: "report.totalAmountOfTopUps",
          },
          {
            field: "totalNumberOfTransactions",
            header: "report.totalNumberOfTransactions",
          },
          {
            field: "totalAmountOfTransactions",
            header: "report.totalAmountOfTransactions",
          },
          {
            field: "currentCommissionRate",
            header: "report.currentCommissionRate",
          },
          {
            field: "totalCommissionAmount",
            header: "report.totalCommissionAmount",
          },
          {
            field: "averageCommissionAmount",
            header: "report.averageCommissionAmount",
          },
        ];
        break;
      }
      case ReportName.CORPORATE_SALES: {
        this.colData = [
          {
            field: `${
              lang === "en" ? "corporateEnName" : "corporateLocaleName"
            }`,
            header: `${
              lang === "en" ? "corporates.enName" : "corporates.localeName"
            }`,
          },
          {
            field: "totalNumberOfTransactions",
            header: "report.totalNumberOfTransactions",
          },
          {
            field: "totalNumberOfMerchants",
            header: "report.totalNumberOfMerchants",
            clickable: true,
          },
          {
            field: "totalNumberOfUsedProductCategories",
            header: "report.totalNumberOfUsedProductCategories",
            clickable: true,
          },
          {
            field: "totalNumberOfVisitedSites",
            header: "report.totalNumberOfVisitedSites",
            clickable: true,
          },
          {
            field: "totalNumberOfVisitedCities",
            header: "report.totalNumberOfVisitedCities",
            clickable: true,
          },
        ];
        break;
      }
      case ReportName.CORPORATE_VEHICLE_CONSUMPTION: {
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
          {
            field: "plateNumber",
            header: "report.plateNumber",
          },
          {
            field: "totalMileage",
            header: "report.totalMileage",
          },
          {
            field: "totalFuelConsumption",
            header: "report.totalFuelConsumption",
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
            header: "report.totalNumberOfTransactionsSinceJoined",
          },
          {
            field: "totalTransactionsAmount",
            header: "report.totalTransactionsAmount",
          },
          {
            field: "lastReadingMileage",
            header: "report.lastReadingMileage",
          },
          {
            field: "averageCalculatedConsumption",
            header: "report.averageCalculatedConsumption",
          },
        ];
        break;
      }
      case ReportName.CORPORATE_VEHICLE_DETAILS: {
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
          {
            field: "plateNumber",
            header: "report.plateNumber",
          },
          {
            field: "fuelType",
            header: "report.fuelType",
          },
          {
            field: "averageNumberOfTransactions",
            header: "report.averageNumberOfTransactions",
          },
          {
            field: "averageNumberOfSites",
            header: "report.averageNumberOfSites",
          },
          {
            field: "averageNumberOfCities",
            header: "report.averageNumberOfCities",
          },
        ];
        break;
      }
    }
    this.colData = this.colData.filter(Boolean)
  }

  getManagementReport(searchObj?: ManagementSearchObj, pageSize?: number, exportType?: string){
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService.getManagementReport(
        removeNullProps(searchObj),
        this.currentPage - 1,
        this.pageSize
      ).subscribe(
        (data)=>{
          if (pageSize) {
            if (data?.managementReportPage?.content.length) {
              this.totalElements = data?.managementReportPage?.totalElements;
              this.oldContent = data?.managementReportPage?.content;
              this.setReportData("managmentReportData",this.oldContent);
            } else {
              this.totalElements = 0
              this.setReportData("managmentReportData",null)
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
              this.setGridData(data.managementReportList);
              setTimeout(() => {
                this.excelService.exportAsExcelFile(
                  document.getElementById("printable-sale"),
                  this.reportName,
                  this.isRtl
                );
                this.setGridData(this.oldContent);
                this.pageSize = 10;
              }, 1000);
            } else if (exportType == "pdf") {
              this.setGridData(data.managementReportList);
              setTimeout(() => {
                this.pdfService.printReport(
                  this.colData, 
                  this.gridData,
                  this.reportName, 
                  this.currentLang,
                )
                this.setGridData(this.oldContent);
                this.pageSize = 10;
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

  getCorporateVehicles(corporateId: number) {
    
    this.subs.add(
      this.corporateVehicleService.getCorporateVehicles(corporateId).subscribe(
        (corporateVehicles: BaseResponse<CorporateVehicle>) => {
          if (corporateVehicles.content?.length > 0) {
            this.corporateVehicles = corporateVehicles.content;
          } else {
            this.corporateVehicles = [];
            //this.toastr.warning("No corporate vehicles found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  selectCorporate(corporateId: number) {
    if(corporateId){
      if (this.reportName === "CORPORATE_VEHICLE_CONSUMPTION") {
        this.getCorporateVehicles(corporateId);
      }
    }else{
      this.corporateVehicles = [];
    }


  }

  setGridData(data) {
    if (data) {
      let formatedData = this.reportService.addCommaToNumberValues(data);
      switch (this.reportName) {
        case ReportName.MANAGEMENT_REPORT: {
          this.gridData = data.map((item: ManagementReport)=>{
            return {
              [`${
                this.currentLang === "en"
                  ? "corporateEnName"
                  : "corporateLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.corporateEnName
                  : item.corporateLocaleName,
              [`${
                this.currentLang === "en"
                  ? "merchantEnName"
                  : "merchantLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.merchantEnName
                  : item.merchantLocaleName,
              [`${
                this.currentLang === "en"
                  ? "siteEnName"
                  : "siteLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.siteEnName
                  : item.siteLocaleName,
              [`${
                this.currentLang === "en"
                  ? "productEnName"
                  : "productLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.productEnName
                  : item.productLocaleName,
              transactionsDate: item.transactionsDate,
              totalQuantity: item.totalQuantity,
              transactionsCommissionAmount: item.transactionsCommissionAmount,
              transactionsAmount: item.transactionsAmount
            }
          });
          break;
        }
        case ReportName.PRODUCT_CATEGORY_CONSUMPTION: {
          this.gridData = formatedData.map((item: ProductCategoryDetailedSales) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "productCategoryEnName"
                  : "productCategoryLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.productCategoryEnName
                  : item.productCategoryLocaleName,
              totalGross: item.totalGross,
              totalNet: item.totalNet,
              totalVat: item.totalVat,
              totalNumberOfMerchants: item.totalNumberOfMerchants,
              totalNumberOfSites: item.totalNumberOfSites,
              totalNumberOfTransactions: item.totalNumberOfTransactions,
              totalNumberOfVehicles: item.totalNumberOfVehicles,
            };
          });
          break;
        }
        case ReportName.PRODUCT_CATEGORY_BUDGET_POLICY: {
          this.gridData = formatedData.map((item: ProductCategoryPolicyBudget) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "corporateEnName"
                  : "corporateLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.corporateEnName
                  : item.corporateLocaleName,
              [`${
                this.currentLang === "en" ? "policyEnName" : "policyLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.policyEnName
                  : item.policyLocaleName,
              policyCycleType: item.policyCycleType,
              numberOfCycles: item.numberOfCycles,
              [`${
                this.currentLang === "en"
                  ? "productCategoryEnName"
                  : "productCategoryLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.productCategoryEnName
                  : item.productCategoryLocaleName,
              numberOfAssignedCardholders: item.numberOfAssignedCardholders,
              numberOfAssignedVehicles: item.numberOfAssignedVehicles,
              allocatedBudget: item.allocatedBudget,
            };
          });
          break;
        }
        case ReportName.COMMISSION_BY_CORPORATE: {
          this.gridData = formatedData.map((item: CorporateCommission) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "corporateEnName"
                  : "corporateLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.corporateEnName
                  : item.corporateLocaleName,
              numberOfTopUps: item.numberOfTopUps,
              totalAmountOfTopUps: item.totalAmountOfTopUps,
              totalNumberOfTransactions: item.totalNumberOfTransactions,
              totalAmountOfTransactions: item.totalAmountOfTransactions,
              currentCommissionRate: item.currentCommissionRate,
              totalCommissionAmount: item.totalCommissionAmount,
              averageCommissionAmount: item.averageCommissionAmount,
            };
          });
          break;
        }
        case ReportName.CORPORATE_SALES: {
          this.gridData = formatedData.map((item: CorporateDetailedSales) => {
            return {
              //todo: remove 4 for test
              id: item.corporateId || 4,
              [`${
                this.currentLang === "en"
                  ? "corporateEnName"
                  : "corporateLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.corporateEnName
                  : item.corporateLocaleName,
              totalNumberOfTransactions: item.totalNumberOfTransactions,
              totalNumberOfMerchants: item.totalNumberOfMerchants,
              totalNumberOfUsedProductCategories:
                item.totalNumberOfUsedProductCategories,
              totalNumberOfVisitedSites: item.totalNumberOfVisitedSites,
              totalNumberOfVisitedCities: item.totalNumberOfVisitedCities,
            };
          });
          break;
        }
        case ReportName.CORPORATE_VEHICLE_CONSUMPTION: {
          this.gridData = formatedData.map((item: VehicleReport) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "vehicleTypeEnName"
                  : "vehicleTypeLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.vehicleTypeEnName
                  : item.vehicleTypeLocaleName,
              plateNumber: item.plateNumber,
              totalMileage: item.totalMileage?.toLocaleString("en-US"),
              totalFuelConsumption: item.totalFuelConsumption?.toLocaleString("en-US"),
              totalMaintenanceConsumption: item.totalMaintenanceConsumption?.toLocaleString("en-US"),
              totalOilChangeConsumption: item.totalOilChangeConsumption?.toLocaleString("en-US"),
              totalNumberOfTransactions: item.totalNumberOfTransactions?.toLocaleString("en-US"),
              totalTransactionsAmount: item.averageFuelTransactionAmount?.toLocaleString("en-US"),
              lastReadingMileage: item.lastReadingMileage?.toLocaleString("en-US"),
              averageCalculatedConsumption: item.averageFuelConsumptionRate?.toLocaleString("en-US"),
            };
          });
          break;
        }
        case ReportName.CORPORATE_VEHICLE_DETAILS: {
          this.gridData = formatedData.map((item: VehicleReport) => {
            return {
              [`${
                this.currentLang === "en"
                  ? "vehicleTypeEnName"
                  : "vehicleTypeLocaleName"
              }`]:
                this.currentLang === "en"
                  ? item.vehicleTypeEnName
                  : item.vehicleTypeLocaleName,
              plateNumber: item.plateNumber,
              fuelType: $localize`fuelType.` + item.fuelType,
              averageNumberOfTransactions: item.averageNumberOfTransactions,
              averageNumberOfCities: item.averageNumberOfCities,
              averageNumberOfSites: item.averageNumberOfSites,
            };
          });
          break;
        }
      }
    } else {
      this.gridData = [];
    }
    
  }

  getCorporates(searchObj?: CorporateSearch) {
    
    this.subs.add(
      this.corporateService.getCorporates(removeNullProps(searchObj)).subscribe(
        (corporates: BaseResponse<Corporate>) => {
          if (corporates.content?.length > 0) {
            this.corporates = corporates.content;
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

  getCorporateCommissionDetails(searchObj: AdminSearchObj) {
    
    this.subs.add(
      this.reportService
        .getCorporateCommissionDetails(removeNullProps(searchObj))
        .subscribe(
          (data: CorporateCommission[]) => {
            if (data?.length > 0) {
              this.setReportData("corporateCommissionDetails", data);
              this.totalElements = data.length;
            } else {
              this.totalElements = 0;
              this.resetReportData("corporateCommissionDetails");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateDetailedSales(searchObj: AdminSearchObj) {
    
    this.subs.add(
      this.reportService
        .getCorporateDetailedSales(removeNullProps(searchObj))
        .subscribe(
          (data: CorporateDetailedSales[]) => {
            if (data?.length > 0) {
              this.setReportData("corporateDetailedSales", data);
              this.totalElements = data.length;
            } else {
              this.totalElements = 0;
              this.resetReportData("corporateDetailedSales");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getCorporateVehicleDetails(searchObj: AdminSearchObj) {
    
    this.subs.add(
      this.reportService
        .getCorporateVehicleDetails(
          searchObj.corporateId,
          removeNullProps(searchObj)
        )
        .subscribe(
          (data: VehicleReport[]) => {
            if (data?.length > 0) {
              this.setReportData("corporateVehicleConsumptions", data);
              this.totalElements = data.length;
            } else {
              this.totalElements = 0;
              this.resetReportData("corporateVehicleConsumptions");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getProductCategoryBudgetByPolicy(
    productCategoryId: number,
    corporateIds: number[]
  ) {
    
    this.subs.add(
      this.reportService
        .getProductCategoryBudgetByPolicy(productCategoryId, corporateIds)
        .subscribe(
          (data: ProductCategoryPolicyBudget[]) => {
            if (data?.length > 0) {
              this.setReportData("productCategoryPolicyBudgets", data);
              this.totalElements = data.length;
            } else {
              this.totalElements = 0;
              this.resetReportData("productCategoryPolicyBudgets");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getProductCategoryConsumeDetails(productCategoryIds: number[]) {
    
    this.subs.add(
      this.reportService
        .getProductCategoryDetailedSales(productCategoryIds)
        .subscribe(
          (data: ProductCategoryDetailedSales[]) => {
            if (data?.length > 0) {
              this.setReportData("ProductCategoryDetailedSales", data);
              this.totalElements = data.length;
            } else {
              this.totalElements = 0;
              this.resetReportData("ProductCategoryDetailedSales");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getVehicleTypes() {
    
    this.subs.add(
      this.corporateVehicleService
        .getVehicleTypes({ suspended: false })
        .subscribe(
          (vehicleTypes: BaseResponse<VehicleType>) => {
            if (vehicleTypes.content?.length > 0) {
              this.vehicleTypes = vehicleTypes.content;
            } else {
              this.toastr.warning("No vehicle types found");
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  setReportData(reportName: string, data: any[]) {
    this[reportName] = data;
    this.resultLength = data?.length;
    this.setGridData(data);
  }

  resetReportData(reportName: string) {
    this.resultLength = null;
    this[reportName] = [];
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

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this[name].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }

  search() {
    this.currentPage = 1;
    const fromMonth = this.fromDate?.split("-")[1] ?? null;
    const toMonth = this.toDate?.split("-")[1] ?? null;
    this.searchObj = {
      ...(this.reportName !== ReportName.MANAGEMENT_REPORT && {corporateIds: this.corporateIds.length
        ? this.corporateIds
        : this["corporates"].map((item) => item.id)}),
      ...(this.reportName === ReportName.COMMISSION_BY_CORPORATE && {
        commissionRate: this.commissionRate,
      }),
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
    };
    switch (this.reportName) {
      case ReportName.MANAGEMENT_REPORT: {
        this.getManagementReport(this.searchObj,this.pageSize);
        break;
      }
      case ReportName.PRODUCT_CATEGORY_BUDGET_POLICY: {
        this.getProductCategoryBudgetByPolicy(
          this.productCategoryId,
          this.corporateIds
        );
        break;
      }
      case ReportName.COMMISSION_BY_CORPORATE: {
        this.getCorporateCommissionDetails(this.searchObj);
        break;
      }
      case ReportName.CORPORATE_SALES: {
        this.getCorporateDetailedSales(this.searchObj);
        break;
      }
      case ReportName.CORPORATE_VEHICLE_CONSUMPTION: {
        this.searchObj = {
          corporateId: this.selectedCorporateId,
          vehicleTypeIds: this.vehicleTypeIds.length
            ? this.vehicleTypeIds
            : this["vehicleTypes"].map((item) => item.id),
          assetIds: this.assetIds.length
            ? this.assetIds
            : this["corporateVehicles"].map((item) => item.id),
          fromMonth: +fromMonth?.startsWith("0")
            ? fromMonth?.replace("0", "")
            : fromMonth,
          toMonth: +toMonth?.startsWith("0")
            ? toMonth?.replace("0", "")
            : toMonth,
        };
        this.getCorporateVehicleDetails(this.searchObj);
        break;
      }
      case ReportName.CORPORATE_VEHICLE_DETAILS: {
        this.searchObj = {
          corporateId: this.corporateId,
          fromMonth: +fromMonth?.startsWith("0")
            ? fromMonth?.replace("0", "")
            : fromMonth,
          toMonth: +toMonth?.startsWith("0")
            ? toMonth?.replace("0", "")
            : toMonth,
        };
        this.getCorporateVehicleDetails(this.searchObj);
        break;
      }
      case ReportName.PRODUCT_CATEGORY_CONSUMPTION: {
        this.searchObj = {
          productCategoryIds: this.productCategoryIds.length
            ? this.productCategoryIds
            : this["productCategories"].map((item) => item.id),
        };
        this.getProductCategoryConsumeDetails(
          this.searchObj.productCategoryIds
        );
        break;
      }
    }
  }

  handleCellClick(cellData: CellData) {
    this.cellData = cellData;
    const { id: corporateId, field } = cellData;
    switch (field) {
      case "totalNumberOfMerchants": {
        this.getCorporateLookup(corporateId, LookupType.MERCHANT);
        break;
      }
      case "totalNumberOfUsedProductCategories": {
        this.getCorporateLookup(corporateId, LookupType.PRODUCT_CATEGORY);
        break;
      }
      case "totalNumberOfVisitedCities": {
        this.getCorporateLookup(corporateId, LookupType.CITY);
        break;
      }
      case "totalNumberOfVisitedSites": {
        this.getCorporateLookup(corporateId, LookupType.SITE);
        break;
      }
    }
  }

  getCorporateLookup(corporateId: number, lookup: LookupType) {
    
    this.subs.add(
      this.reportService.getCorporateLookup(corporateId, lookup).subscribe(
        (data: Lookup[]) => {
          if (data.length) {
            this.setReportDataModal(data);
          } else {
            this.toastr.warning("No data found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  fetchCorporates() {
    this.getCorporates({
      ids: this.relatedSystemIds
        ? this.relatedSystemIds?.split(",")?.map(Number)
        : null,
      suspended: this.suspended,
    });
  }

  setReportDataModal(data: Lookup[]) {
    this.dataModal = data;
    this.reportDataModal.open();
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.handlePagination();
  }

  handlePagination() {
    if (this.searchObj) {
      this.getManagementReport(this.searchObj, this.pageSize);
    }else{
      this.getManagementReport(null, this.pageSize);
    }
  }

  exportAsXLSX(): void {
    if (this.currentLang === "ar") {
      this.isRtl = true;
    }
    // this.pageSize = null;
    this.isExportExcel = true
    this.getManagementReport(this.searchObj,null,"excel");
  }

  openPDF(): void {
    this.getManagementReport(this.searchObj,null,"pdf");
    // this.pdfService.printReport(this.colData, this.gridData , this.reportTitle, this.currentLang)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
