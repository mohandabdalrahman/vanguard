import {Component, OnDestroy, OnInit} from "@angular/core";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {MerchantDashboard} from "@models/merchant-dashboard.model";
import {SubSink} from "subsink";
import {Merchant} from "../../admin/merchants/merchant.model";
import {MerchantService} from "../../admin/merchants/merchant.service";
import {ReportService} from "@shared/services/report.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";
import {ChartData} from "@models/dashboard.model";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: "app-merchant-home",
  templateUrl: "./home.component.html",
  styleUrls: ["../../scss/home.component.scss", './home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  cards: { name: string, count: number, icon: string }[] = []
  merchantId: number;
  merchant: Merchant
  currentLang: string;
  dashboard: MerchantDashboard
  invoicesAmount: ChartData[] = []
  averageTransactionSizePerCategory: ChartData[] = []
  currentMonthTotalSalesPerCategory: ChartData[] = []
  currentMonthTotalSalesPerSite: ChartData[] = []
  totalSalesAcrossMonthsPerCategory: any[] = []
  totalSalesAcrossMonthsPerSite: any[] = []
  totalSalesAcrossMonthDaysPerCategory: any[] = []
  totalSalesAcrossMonthDaysPerSite: any[] = []
  view: any[] = [500, 400];
  legend: boolean = true;

  // options for stacked bar chart
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  ProductXAxisLabel: string;
  MonthsXAxisLabel: string;
  DaysXAxisLabel: string;
  siteXAxisLabel: string;
  showYAxisLabel: boolean = true;
  yAxisLabel: string;
  animations: boolean = true;
  itemMonth: string;


  constructor(
              
              private toastr: ToastrService,
              private errorService: ErrorService,
              private reportService: ReportService,
              private merchantService: MerchantService,
              private currentLangService: CurrentLangService,
              private translate: TranslateService,
              private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.merchantId = +getRelatedSystemId(null, "merchantId");
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setTranslation();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.invoicesAmount = []
        this.setTranslation()
        if (this.dashboard) {
          this.setCards(this.dashboard)
          this.runAllCharts(this.dashboard)
        }
      }),
    )
    if (this.merchantId && this.authService.getLoggedInUserRoles().includes("DASHBOARD_VIEW")) {
      this.getMerchant()
      this.getMerchantDashboard();
    }
  }

  setCards(dashboard: MerchantDashboard) {
    this.cards = [
      {
        name: this.currentLang === "en" ? "sites" : "المتاجر",
        count: dashboard.numberOfSites,
        icon: "/assets/img/home/sites.svg"
      },
      {
        name: this.currentLang === "en" ? "users" : "المستخدمين",
        count: dashboard.numberOfUsers,
        icon: "/assets/img/home/users.svg"
      },
      {
        name: this.currentLang === "en" ? "products" : "المنتجات",
        count: dashboard.numberOfProducts,
        icon: "/assets/img/home/products.svg"
      },
      {
        name: this.currentLang === "en" ? "Sales This Month" : "مجموع المبيعات هذا الشهر",
        count: dashboard.totalSalesThisMonth,
        icon: "/assets/img/home/transactions.svg",
      },
    ];
  }

  setChartData(data: any[], name: string, isMulti: boolean = false, showDays: boolean = false) {
    if (!isMulti) {
      this[name] = data.map((item) => {
        return {
          name: this.currentLang === "en" ? item.enName || item.zoneEnName || item.productCategoryEnName : item.localeName || item.zoneLocaleName || item.productCategoryLocaleName,
          value: item.totalExpenses
        };
      });
    } else {
      this[name] = data.map((item) => {
        this.translate.get("app.months." + item.month.toUpperCase()).subscribe((res) => this.itemMonth = res as string);
        const series = [];
        series.push({
          name: this.currentLang === "en" ? item.enName || item.siteEnName || item.productCategoryEnName : item.localeName || item.siteLocaleName || item.productCategoryLocaleName,
          value: item.totalSales
        })
        return {
          name: showDays ? item.day + " " + this.itemMonth : this.itemMonth + " " + item.year,
          series
        };
      });
      this.itemMonth = "";
    }
  }

  getMerchantDashboard() {
    
    this.subs.add(
      this.reportService.getMerchantDashboard(this.merchantId).subscribe(
        (dashboard: MerchantDashboard) => {
          if (dashboard) {
            this.dashboard = dashboard;
            this.setCards(dashboard);
            this.runAllCharts(dashboard)
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

  getMerchant() {
    
    this.subs.add(
      this.merchantService
        .getMerchant(this.merchantId)
        .subscribe(
          (merchant: Merchant) => {
            if (merchant) {
              this.merchant = merchant
            } else {
              this.translate.get(["error.noMerchantsFound", "type.warning"]).subscribe(
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


  runAllCharts(dashboard: MerchantDashboard) {
    if (dashboard.invoicesSettledAmount) {
      this.invoicesAmount.push({
        "name": this.currentLang === "en" ? 'Invoices Settled Amount' : 'مبلغ تسوية الفواتير',
        "value": dashboard.invoicesSettledAmount + " " + (this.currentLang === "en" ? "EGP" : "ج.م")
      })
    }
    if (dashboard.invoicesIssuedAmount) {
      this.invoicesAmount.push({
        "name": this.currentLang === "en" ? 'Invoices Issued Amount' : 'قيمة الفواتير المصدره',
        "value": dashboard.invoicesIssuedAmount + " " + (this.currentLang === "en" ? "EGP" : "ج.م")
      })
    }
    if (dashboard.invoicesPreIssuedAmount) {
      this.invoicesAmount.push({
        "name": this.currentLang === "en" ? 'Invoices PreIssued Amount' : 'مبالغ قيد الأصدار للفواتير',
        "value": dashboard.invoicesPreIssuedAmount + " " + (this.currentLang === "en" ? "EGP" : "ج.م")
      })
    }

    this.setChartData(dashboard.averageTransactionSizePerCategory, "averageTransactionSizePerCategory");
    this.setChartData(dashboard.currentMonthTotalSalesPerCategory, "currentMonthTotalSalesPerCategory");
    this.setChartData(dashboard.currentMonthTotalSalesPerSite, "currentMonthTotalSalesPerSite");
    this.setChartData(dashboard.totalSalesAcrossMonthsPerCategory, "totalSalesAcrossMonthsPerCategory", true);
    this.setChartData(dashboard.totalSalesAcrossMonthsPerSite, "totalSalesAcrossMonthsPerSite", true);
    this.setChartData(dashboard.totalSalesAcrossMonthDaysPerCategory, "totalSalesAcrossMonthDaysPerCategory", true, true);
    this.setChartData(dashboard.totalSalesAcrossMonthDaysPerSite, "totalSalesAcrossMonthDaysPerSite", true, true)

  }

  setTranslation() {
    this.ProductXAxisLabel = this.currentLang === "en" ? 'Product Category' : "تصتيف المنتج";
    this.MonthsXAxisLabel = this.currentLang === "en" ? 'Months' : "الشهور";
    this.DaysXAxisLabel = this.currentLang === "en" ? 'Days' : "الأيام";
    this.siteXAxisLabel = this.currentLang === "en" ? 'Site' : "منفذ البيع";
    this.yAxisLabel = this.currentLang === "en" ? 'Total Sales' : "إجمالي المبيعات";
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
