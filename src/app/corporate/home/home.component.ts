import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SubSink} from "subsink";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {ReportService} from "@shared/services/report.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {CorporateDashboard} from "@models/corporate-dashboard.model";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {CorporateService} from "../../admin/corporates/corporate.service";
import {Corporate} from "../../admin/corporates/corporate.model";
import {TranslateService} from "@ngx-translate/core";
import {ChartData} from "@models/dashboard.model";
import {AuthService} from "../../auth/auth.service";
import {ProductCategoryService} from "../../admin/product/productCategory.service";
import {ProductCategory} from "../../admin/product/product-category.model";

@Component({
  selector: "app-corporate-home",
  templateUrl: "./home.component.html",
  styleUrls: ["../../scss/home.component.scss", "./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  corporate: Corporate;
  dashboard: CorporateDashboard;
  totalSalesPerCategory: ChartData[] = [];
  totalSalesPerCity: ChartData[] = [];
  topTenCardHolders: ChartData[] = [];
  topTenVehicles: ChartData[] = [];
  topTenHardware: ChartData[] = [];
  topTenContainers: ChartData[] = [];
  totalSalesAcrossMonthsPerCategory: ChartData[] = [];
  currentMonthTotalSalesPerCategory: ChartData[] = [];
  availableBalance: ChartData[] = [];
  totalSalesAcrossMonthsPerZone: ChartData[] = [];

  // view: any[] = [500, 400];
  legend: boolean = true;

  // options for stacked bar chart
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  ProductXAxisLabel: string;
  MonthsXAxisLabel: string;
  ZoneXAxisLabel: string;
  showYAxisLabel: boolean = true;
  yAxisLabel: string = "Total Expenses";
  animations: boolean = true;
  itemMonth: string;
  userType: string;
  productCategory: ProductCategory;
  PRODUCT_ID = 4;
  // colorScheme = {
  //   domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  // };

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private reportService: ReportService,
    private currentLangService: CurrentLangService,
    private corporateService: CorporateService,
    private translate: TranslateService,
    private authService: AuthService,
    private productCategoryService: ProductCategoryService
  ) {
  }

  ngOnInit(): void {
    this.getProductCategory();
    this.route.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");
    });
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.setTranslation();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setTranslation();
        this.availableBalance = [];
        if (this.dashboard) {
          this.runAllCharts(this.dashboard);
        }
      })
    );
    if (
      this.corporateId &&
      this.authService.getLoggedInUserRoles().includes("DASHBOARD_VIEW")
    ) {
      this.getCorporate();
      this.getCorporateDashboard();
    }
  }

  setChartData(
    data: any[],
    name: string,
    isMulti: boolean = false,
    isAsset: boolean = false
  ) {
    if (!isMulti) {
      this[name] = data.map((item) => {
        return {
          name: !isAsset
            ? this.currentLang === "en"
              ? item.enName || item.zoneEnName || item.productCategoryEnName
              : item.localeName ||
              item.zoneLocaleName ||
              item.productCategoryLocaleName
            : item.id,
          value: item.totalExpenses,
        };
      });
    } else {
      this[name] = data.map((item) => {
        this.translate
          .get("app.months." + item.month.toUpperCase())
          .subscribe((res) => (this.itemMonth = res as string));
        const series = [];
        series.push({
          name:
            this.currentLang === "en"
              ? item.enName || item.zoneEnName || item.productCategoryEnName
              : item.localeName ||
              item.zoneLocaleName ||
              item.productCategoryLocaleName,
          value: item.totalExpenses,
        });
        return {
          name: this.itemMonth + " " + item.year,
          series,
        };
      });
      this.itemMonth = "";
    }
  }

  getCorporateDashboard() {
    
    this.subs.add(
      this.reportService.getCorporateDashboard(this.corporateId).subscribe(
        (dashboard: CorporateDashboard) => {
          if (dashboard) {
            this.dashboard = dashboard;
            this.runAllCharts(dashboard);
          } else {
            this.toastr.warning("No dashboard found");
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCorporate() {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate: Corporate) => {
          if (corporate) {
            this.corporate = corporate;
          } else {
            this.translate
              .get(["error.noCorporatesFound", "type.warning"])
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

  runAllCharts(dashboard: CorporateDashboard) {
    if (dashboard.opiningBalanceThisMonth && this.productCategory?.price) {
      this.availableBalance.push({
        //cant use $localize here !!
        name:
          this.currentLang === "en"
            ? "The balance is equivalent to liters of diesel"
            : "مايُعادل الرصيد لترات ديزل",
        value: `${(dashboard.availableBalanceThisMonth / this.productCategory?.price).toFixed(2) } ${
          this.currentLang === "en" ? "liter" : "لتر"
        }`,
      });
    }
    if (dashboard.availableBalanceThisMonth) {
      this.availableBalance.push({
        name:
          this.currentLang === "en"
            ? "Available Balance This Month"
            : "الرصيد المتاح لهذا الشهر",
        value: `${dashboard.availableBalanceThisMonth} ${
          this.currentLang === "en" ? "EGP" : "ج.م"
        }`,
      });
    }
    if (dashboard.paidAmountThisMonth) {
      this.availableBalance.push({
        name:
          this.currentLang === "en"
            ? "Paid Amount This Month"
            : "المبلغ المدفوع لهذا الشهر",
        value: `${dashboard.paidAmountThisMonth} ${
          this.currentLang === "en" ? "EGP" : "ج.م"
        }`,
      });
    }
    this.setChartData(dashboard.totalSalesPerCategory, "totalSalesPerCategory");
    this.setChartData(dashboard.totalSalesPerCity, "totalSalesPerCity");
    this.setChartData(dashboard.topTenCardHolders, "topTenCardHolders");
    this.setChartData(dashboard.topTenVehicles, "topTenVehicles", false, true);
    // this.setChartData(dashboard.topTenHardware, "topTenHardware", false, true);
    // this.setChartData(dashboard.topTenContainers, "topTenContainers", false, true);
    this.setChartData(
      dashboard.currentMonthTotalSalesPerCategory,
      "currentMonthTotalSalesPerCategory"
    );
    this.setChartData(
      dashboard.totalSalesAcrossMonthsPerCategory,
      "totalSalesAcrossMonthsPerCategory",
      true
    );
    this.setChartData(
      dashboard.totalSalesAcrossMonthsPerZone,
      "totalSalesAcrossMonthsPerZone",
      true
    );
  }

  setTranslation() {
    this.ProductXAxisLabel =
      this.currentLang === "en" ? "Product Category" : "نصنيف منتج";
    this.MonthsXAxisLabel = this.currentLang === "en" ? "Months" : "شهور";
    this.ZoneXAxisLabel = this.currentLang === "en" ? "Zones" : "مناطق";
    this.yAxisLabel =
      this.currentLang === "en" ? "Total expenses" : "إجمالي المصروفات";
  }

  getProductCategory() {
    
    this.subs.add(
      this.productCategoryService.getProduct(this.PRODUCT_ID).subscribe(productCategory => {
      this.productCategory = productCategory;
        
      }, err => {
        this.errorService.handleErrorResponse(err);
      })
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
