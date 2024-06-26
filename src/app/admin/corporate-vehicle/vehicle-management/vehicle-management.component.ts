import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AlertableData, CorporateVehicle} from "../corporate-vehicle.model";
import {SubSink} from "subsink";
import {CorporateVehicleService} from "../corporate-vehicle.service";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ActivatedRoute, Router} from "@angular/router";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {OuNode} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {CorporateAlertService} from "../../corporate-alert/corporate-alert.service";
import {GenericAlert} from "../../corporate-alert/corporate-alert.model";
import {ColData} from "@models/column-data.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {CreateManualReviewComponent} from "@shared/create-manual-review/create-manual-review.component";


@Component({
  selector: 'app-vehicle-management',
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class VehicleManagementComponent implements OnInit {
  private subs = new SubSink();
  corporateId: number;
  corporateVehicleId: number;
  @ViewChild('item') accordion;
  @ViewChild('createManualReview') createManualReviewComponent: CreateManualReviewComponent;
  corporateVehicle: CorporateVehicle
  currentLang: string;
  elapsedPeriodInDays: number;
  selectedOuNode: OuNode;
  ouId: number;
  currentPage: number = 1;
  totalElements: number;
  pageSize = 10;
  gridData: GenericAlert[] = [];
  colData: ColData[] = [];
  alertableDataId: number;
  isCollapsed: boolean;
  currentReviewName: string;
  alertableData: AlertableData
  productCategoryId: number;

  constructor(
    private route: ActivatedRoute,
    
    private corporateVehicleService: CorporateVehicleService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private currentLangService: CurrentLangService,
    private corporateOuService: CorporateOuService,
    private authService: AuthService,
    private router: Router,
    private corporateAlertService: CorporateAlertService,
    private queryParamsService: QueryParamsService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.corporateVehicle = JSON.parse(sessionStorage.getItem('corporateVehicle'))
    this.selectedOuNode = this.corporateOuService?.selectedOuNode || JSON.parse(sessionStorage.getItem('selectedOuNode'));
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.router.url.includes('organizational-chart/units')) {
          this.ouId = +getRelatedSystemId(params, "ouId");
        } else if (this.authService.getUserType() === 'admin') {
          this.ouId = (this.authService.isAdminCorporateOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getRootOuId();
        } else {
          this.ouId = (this.authService.isOuEnabled() && this.selectedOuNode?.id) ? this.selectedOuNode?.id : this.authService.getOuId();
        }
      }),
      this.route.params.subscribe((params) => {
        this.corporateVehicleId = params["corporateVehicleId"];
      })
    )
    if (!this.corporateVehicle && this.corporateId && this.corporateVehicleId) {
      this.getCorporateVehicleDetails()
    }
    this.setColData();
    if (this.corporateVehicle.alertableData.length) {
      this.corporateVehicle.alertableData.forEach((alertableData) => {
        this.getGenericAlerts(alertableData)
      })
    }
  }

  setColData() {
    this.colData = [
      {
        field: "creationDate",
        header: "alert.time"
      },
      {
        field: "lastReadingDistance",
        header: "alert.alarmTime"
      },
      {
        field: "currentServiceTravelledDistance",
        header: "alert.oilMileageTime"
      },
    ]
  }

  setGridData(data: GenericAlert[]) {
    this.gridData = data.map((alert) => {
      return {
        creationDate: alert.creationDate,
        lastReadingDistance: alert.lastReadingDistance,
        currentServiceTravelledDistance: alert.currentServiceTravelledDistance
      }
    })
    this.corporateVehicle.alertableData.find((alertableData) => alertableData?.alertableDataId === this.alertableDataId).data = this.gridData;

  }

  openManualReviewModal(field: AlertableData) {
    this.productCategoryId = field.productCategoryId;
    this.currentReviewName = this.currentLang === 'en' ? field.alerteableFieldEnName : field.alerteableFieldLocaleName;
    this.createManualReviewComponent.resetManualReviewModal();
    this.createManualReviewComponent.manualReviewModal.open();
  }


  getCorporateVehicleDetails(): void {
    
    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicle(this.corporateId, this.corporateVehicleId)
        .subscribe(
          (corporateVehicle: CorporateVehicle) => {
            if (corporateVehicle) {
              this.corporateVehicle = corporateVehicle;
            } else {
              this.translate
                .get(["error.noVehiclesFound", "type.warning"])
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

  calculateElapsedPeriod(lastChangedDate: string): number {
    if (!lastChangedDate) return null;
    const lastChangedDateInMilliseconds = new Date(lastChangedDate).getTime();
    const currentDateInMilliseconds = new Date().getTime();
    const elapsedPeriodInMilliseconds = currentDateInMilliseconds - lastChangedDateInMilliseconds;
    this.elapsedPeriodInDays = Math.floor(elapsedPeriodInMilliseconds / (1000 * 60 * 60 * 24));
    return this.elapsedPeriodInDays;
  }

  calculateRemainingDays(claimingNumberOfDays: number): number {
    if (this.isNullOrUndefined(claimingNumberOfDays) || this.isNullOrUndefined(this.elapsedPeriodInDays)) return null;
    return claimingNumberOfDays - this.elapsedPeriodInDays;
  }


  getGenericAlerts(alertableData: AlertableData) {
    this.alertableData = alertableData;
    // this.isCollapsed = isCollapsed;
    // if (isCollapsed) return;
    this.alertableDataId = alertableData.alertableDataId;
    
    this.subs.add(
      this.corporateAlertService.getGenericAlerts({
        alertableDataId: this.alertableDataId,
        assetId: this.corporateVehicle.id,
        ouIds: [this.ouId],
        corporateIds: [this.corporateId]
      }).subscribe((alerts) => {
        
        if (alerts.content?.length) {
          alertableData.data = alerts.content;
          // this.totalElements = alerts.totalElements;
          // this.setGridData(alerts.content);
        } else {
          this.totalElements = 0;
          this.setGridData([]);
          this.translate
            .get(["error.noCorporateAlerts", "type.warning"])
            .subscribe((res) => {
              this.toastr.warning(
                Object.values(res)[0] as string,
                Object.values(res)[1] as string
              );
            });
        }
      }, err => {
        this.errorService.handleErrorResponse(err)
      })
    )
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addManyQueryParameters({"page": page})
    this.getGenericAlerts(this.alertableData)
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addManyQueryParameters({"pageSize": pageSize})
    this.currentPage = 1;
    this.getGenericAlerts(this.alertableData)
  }

//   method to check if value is null or undefined
  isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }
}
