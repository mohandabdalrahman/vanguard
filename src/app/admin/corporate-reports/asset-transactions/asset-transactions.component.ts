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
import { Sale, TransactionsReportDto, TransactionsReportsSearchObj } from "@models/reports.model";
import { PdfService } from "@shared/services/pdf.service";
import { ReportService } from "@shared/services/report.service";
import { CorporateVehicle } from "../../corporate-vehicle/corporate-vehicle.model";
import { CorporateVehicleService } from "../../corporate-vehicle/corporate-vehicle.service";
import { ActivatedRoute } from "@angular/router";
import { AssetType } from "@models/asset-type";
import { CorporateHardware } from "../../corporate-hardware/corporate-hardware.model";
import { CorporateHardwareService } from "../../corporate-hardware/corporate-hardware.service";
import { CorporateContainer } from "../../corporate-container/corporate-container.model";
import { CorporateContainerService } from "../../corporate-container/corporate-container.service";
import { addDays, fixTimeZone } from "@helpers/timezone.module";
import { ProductCategory } from "../../product/product-category.model";
import { ProductCategoryService } from "app/admin/product/productCategory.service";
import { AuthService } from "app/auth/auth.service";
import { ReportName } from "app/admin/admin-reports/report-name.model";
import {AssetTag} from "@models/asset-tag";
import {AssetTagService} from "@shared/services/asset-tag.service";

@Component({
  selector: "app-asset-transactions",
  templateUrl: "./asset-transactions.component.html",
  styleUrls: ["../../../scss/common-sales-style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AssetTransactionsComponent implements OnInit, OnDestroy {
  @ViewChild("reportForm") submitForm: NgForm;
  private subs = new SubSink();
  gridData: any[] = [];
  colData: ColData[] = [];
  currentLang: string;
  corporateId: number;
  fromDate: string;
  toDate: string;
  sales: Sale[];
  salesTotal: TransactionsReportDto;
  currentPage: number = 1;
  totalElements: number;
  searchObj;
  assetIds: number[] = [];
  assetType: string;
  corporateVehicles: CorporateVehicle[] = [];
  corporateHardwares: CorporateHardware[] = [];
  corporateContainers: CorporateContainer[] = [];
  isRtl: boolean;
  pageSize = 10;
  reportName: string;
  reportTitle: string;
  productCategoryIds: number[] = [];
  productCategories: ProductCategory[] = [];
  userType: string;
  selectedOuIds: number[] = [];
  ouEnabled: boolean;
  isAdminCorporateOuEnabled: boolean;
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
    private productCategoryService: ProductCategoryService,
    private authService: AuthService,
    private assetTagService: AssetTagService
  ) {
  }

  ngOnInit(): void {
    this.ouEnabled = this.authService.isOuEnabled();
    this.isAdminCorporateOuEnabled = this.authService.isAdminCorporateOuEnabled();
    this.assetType = this.route.snapshot.data["assetType"];
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.reportTitle = this.route.snapshot.data["reportName"];
    this.getReportName(this.currentLang)
    this.setColData(this.currentLang);
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.getReportName(this.currentLang)
        this.setColData(this.currentLang);
        this.setGridData(this.sales);
      }),
      this.reportService.getDate().subscribe((date) => {
        this.fromDate = date?.fromDate;
        this.toDate = date?.toDate;
      }),
      this.reportService.getSelectedOuIds().subscribe((data) => {
        this.selectedOuIds = data
      })
    );
    if (this.corporateId && this.assetType === AssetType.Vehicle || this.assetType === AssetType.User) {
      this.getCorporateVehicles(this.corporateId);
      this.getProductCategories();

    }
    if (this.corporateId && this.assetType === AssetType.Hardware) {
      this.getCorporateHardwares(this.corporateId);
    }
    if (this.corporateId && this.assetType === AssetType.Container) {
      this.getCorporateContainers(this.corporateId);
    }
    this.fromDate = this.reportService?.date?.fromDate;
    this.toDate = this.reportService?.date?.toDate;
    this.selectedOuIds = this.reportService?.ouIds;
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
      {field: "transactionUuid", header: "report.transactionItemId"},
      //(this.ouEnabled || this.isAdminCorporateOuEnabled)  && {field:`${lang === "en" ? "ouEnName" : "ouLocaleName"}` , header:"report.ouName"},
      //...[(this.reportTitle === ReportName.VEHICLE_DETAILED_EXPENSES && { field: "vehiclePlateNumber", header: "report.vehiclePlateNumber" })],
      ...[(this.reportTitle === ReportName.VEHICLE_DETAILED_EXPENSES && { field: "vehicleCode", header: "corporateVehicle.vehicleCode" })],
      (this.ouEnabled || this.isAdminCorporateOuEnabled) && {
        field: `${lang === "en" ? "ouEnName" : "ouLocaleName"}`,
        header: "report.ouName"
      },
      ...[(this.reportTitle === ReportName.VEHICLE_DETAILED_EXPENSES && {
        field: "vehiclePlateNumber",
        header: "report.vehiclePlateNumber"
      })],
      {
        field: `${lang === "en" ? "cardHolderEnName" : "cardHolderLocaleName"}`,
        header: `${
          lang === "en"
            ? "report.cardHolderEnName"
            : "report.cardHolderLocaleName"
        }`,
      },
      {
        field: `${lang === "en" ? "productEnName" : "productLocaleName"}`,
        header: "report.productName",
      },
      {
        field: `${
          lang === "en" ? "productCategoryEnName" : "productCategoryLocaleName"
        }`,
        header: "report.productCategory",
      },
      {field: "quantity", header: "report.quantity"},
      {field: "netAmount", header: "report.transactionNetAmount"},
      {field: "vatAmount", header: "invoice.product.vat"},
      {
        field: "grossAmount",
        header: "report.transactionGrossAmount",
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
        field: "transactionCreationDate",
        header: "report.transactionDate",
      } ,
      {
        field: "assetTagName",
        header: "corporateVehicle.assetTag",
      }
    ].filter(Boolean);
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
          transactionCreationDate:  new Date(
            sale.creationDate
          ).toLocaleDateString() + " "  +new Date(
            sale.creationDate
          ).toLocaleTimeString(),
          ...(this.assetType === AssetType.Vehicle && {
            vehiclePlateNumber: sale.vehiclePlateNumber,
          }),
          ...(this.assetType === AssetType.Vehicle && {
            vehicleCode: sale.vehicleCode,
          }),
          ...(this.assetType === AssetType.Hardware && {
            assetId: sale.assetId,
          }),
          ...(this.assetType === AssetType.Container && {
            assetId: sale.assetId,
          }),
          [`${
            this.currentLang === "en"
              ? "cardHolderEnName"
              : "cardHolderLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.cardHolderEnName
              : sale.cardHolderLocaleName,
          [`${
            this.currentLang === "en"
              ? "productCategoryEnName"
              : "productCategoryLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.productCategoryEnName
              : sale.productCategoryLocaleName,
          [`${
            this.currentLang === "en" ? "productEnName" : "productLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.productEnName
              : sale.productLocaleName,
          [`${
            this.currentLang === "en" ? "merchantEnName" : "merchantLocaleName"
          }`]:
            this.currentLang === "en"
              ? sale.merchantEnName
              : sale.merchantLocaleName,
          transactionUuid: this.corporateId !== 68 ? sale.uuid : sale.transactionItemId, // BAD CODE BUT NEEDED FOR ONLY ONE CORPORATE !!!!!!!!!
          grossAmount: sale.grossAmountIncludingVat,
          quantity: sale.quantity,
          netAmount: sale.netAmount,
          vatAmount: sale.vatAmount,
          [`${this.currentLang === "en" ? "cityEnName" : "cityLocaleName"}`]:
            this.currentLang === "en" ? sale.cityEnName : sale.cityLocaleName,
          assetTagName:  this.assetTags.find((tag) => (tag.id+"") === sale.assetTagId)?.enName
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getVehicleTransactionsItemsReport(searchObj?: TransactionsReportsSearchObj, pageSize?: number, exportType?: string) {
    this.pageSize = pageSize;
    
    this.subs.add(
      this.reportService
        .getTransactionsItemsReport(
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (transactionItem: TransactionsReportDto) => {
            if (pageSize) {
              if (transactionItem?.transactionItemPage?.content.length) {
                this.salesTotal = transactionItem;
                this.totalElements = transactionItem.transactionItemPage.totalElements;
                this.sales = transactionItem?.transactionItemPage?.content;
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
                this.setGridData(transactionItem.transactionItemList);
                setTimeout(() => {
                  this.excelService.exportAsExcelFile(
                    document.getElementById("printable-sale"),
                    `${this.currentLang == "en" ? "Vehicle's Detailed Expenses" : "تفاصيل مصروفات المركبات لكل معامله"}`,
                    this.isRtl
                  );
                  this.setGridData(this.sales);
                  this.pageSize = 10;
                }, 1000);
              } else if (exportType == "pdf") {
                this.setGridData(transactionItem.transactionItemList);
                setTimeout(() => {
                  this.pdfService.printReport(
                    this.colData,
                    this.gridData,
                    this.reportName,
                    this.currentLang,
                    {
                      pdfData: [{
                        dataLabel: {
                          groupOneData: [
                            {
                              header: 'report.totalNumberOfTransactions',
                              field: `${this.salesTotal.totalNumberOfTransactions}`
                            },
                            {header: 'report.totalTransactionNetAmount', field: `${this.salesTotal.totalNetAmounts}`},
                          ],
                          groupTwoData: [
                            {
                              header: 'report.totalTransactionGrossAmount',
                              field: `${this.salesTotal.totalAmountsIncludingVat}`
                            },
                            {header: 'report.transactionTotalVat', field: `${this.salesTotal.totalVatAmounts}`},
                          ],
                        },
                        metaData: {
                          headerTitle: 'app.total'
                        }
                      }],
                      pdfComponentsWidth: {
                        titleSizeTwo: 50,
                        tableLabelWidth: 50,
                        tableValueWidth: 50,
                      }
                    }
                  )
                  this.setGridData(this.sales);
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

  getProductCategories() {
    
    this.subs.add(
      this.productCategoryService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
          } else {
            this.translate.get(["error.noProductCategoriesFound", "type.warning"]).subscribe(
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

  searchSite() {
    this.searchObj = {
      ...(this.userType === "admin" && {
        corporateIds: [this.corporateId]
      }),
      ouIds: this.selectedOuIds,
      assetTypes: this.assetType,
      assetIds: this.assetIds.length
        ? this.assetIds
        : null,
      assetTagIds: this.assetTagIds.length ? this.assetTagIds : null,
      productCategoryIds: this.productCategoryIds.length
        ? this.productCategoryIds
        : null,
      fromDate: this.fromDate ? fixTimeZone(Date.parse(this.fromDate)) : null,
      toDate: this.toDate ? fixTimeZone(addDays(Date.parse(this.toDate), 1)) : null,
    };
    this.currentPage = 1;
    this.getVehicleTransactionsItemsReport(this.searchObj, this.pageSize);
  }

  exportAsXLSX(): void {
    this.getVehicleTransactionsItemsReport(this.searchObj, null, "excel");
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getVehicleTransactionsItemsReport(this.searchObj, this.pageSize);
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getVehicleTransactionsItemsReport(this.searchObj, this.pageSize);
  }

  openPDF(): void {
    this.getVehicleTransactionsItemsReport(this.searchObj, null, "pdf");
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
