import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ReportService} from "@shared/services/report.service";
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";
import {filter} from "rxjs/operators";
import { AuthService } from "app/auth/auth.service";
import { CorporateOu } from "app/admin/organizational-chart/corporate-ou.model";

import { CorporateService } from "app/admin/corporates/corporate.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { CorporateOusSearch } from "app/admin/corporates/corporate.model";
import { BaseResponse } from "@models/response.model";
import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";

@Component({
  selector: "app-list-merchant-reports",
  templateUrl: "./list-merchant-reports.component.html",
  styleUrls: ["./list-merchant-reports.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListMerchantReportsComponent implements OnInit {
  private subs = new SubSink();
  pageTitle: string;
  links = [];
  currentLang: string;
  todayDate = new Date().toISOString().split('T')[0]
  currentUrl: string;
  isVehicleReport: boolean;
  hideDate = false;
  userType:string;
  corporateId: number
  ouEnabled: boolean;
  ouTreeIds: number[]=[];
  corporateOus: CorporateOu[]=[];
  selectedOuIds;

  constructor(
    public route: ActivatedRoute,
    public reportService: ReportService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private authService:AuthService,
    private router: Router,
    
    private corporateService: CorporateService,
    private toastr: ToastrService,
    private errorService: ErrorService,

  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // this.pageTitle = event.url.split("/").slice(-1)[0].replace(/-/g, " ");
      this.currentUrl = event.url;
      this.isVehicleReport =  this.currentUrl.includes('Vehicle-consumption-details') || this.currentUrl.includes('corporate-vehicle-consumption') || this.currentUrl.includes('vehicle-main-info')
      this.hideDate = this.currentUrl.includes('productCategory-budget-policy') || this.currentUrl.includes('productCategory-consume-details')
      this.selectActiveReport()
    });
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType= this.authService.getUserType()
    this.ouEnabled = this.authService.isOuEnabled();
    if(this.ouEnabled){
      this.ouTreeIds = this.authService.getOuTreeIds()?.split(",").map(Number);
    }
    this.links = this.route.snapshot.data["links"];
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.selectActiveReport()
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
    );

    if(this.ouEnabled && !this.currentUrl.includes('top-up')){
      this.getCorporateOus({
        corporateId: this.corporateId,
        suspended:false,
        ouIds:this.ouTreeIds
      })
    }
  }

  getCorporateOus(searchObj: CorporateOusSearch){
    
    this.subs.add(
      this.corporateService.getCorporateOus(
        this.corporateId,
        searchObj,
      ).subscribe(
        (corporateOus: BaseResponse<CorporateOu>) => {
          if(corporateOus.content?.length>0){
            this.corporateOus = corporateOus.content;
            if(!this.selectedOuIds){
              this.selectedOuIds = this.corporateOus.map((item) => item.id);
              this.reportService.sendSelectedOuIds(this.selectedOuIds)
            }
          } else {
            this.corporateOus = []
            this.translate
                .get(["error.noCorporateOusFound", "type.warning"])
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

  selectedOus(values: any[], name: string) {
    if (values.length == 0 || values.includes("selectAll")) {
      this.selectedOuIds = this[name].map((item) => item.id);
      this.reportService.sendSelectedOuIds(this.selectedOuIds)
    } else {
      this.reportService.sendSelectedOuIds(values)
    }
  }

  selectActiveReport() {
    setTimeout(() => {
      this.pageTitle = document.querySelector('.nav-link.active-tab')?.textContent;
    }, 1500)
  }
}
