import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {SubSink} from "subsink";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {BaseResponse} from "@models/response.model";
import {AlertType, CorporateAlert, GenericAlertType} from "../corporate-alert.model";
import {CorporateAlertService} from "../corporate-alert.service";
import {ColData} from "@models/column-data.model";
import {AuthService} from "../../../auth/auth.service";
import {Corporate} from "../../corporates/corporate.model";
import {CorporateService} from "../../corporates/corporate.service";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {AssetType} from "@models/asset-type";
import {removeNullProps} from "@helpers/check-obj";
import {CorporateVehicle} from "app/admin/corporate-vehicle/corporate-vehicle.model";
import {CorporateVehicleService} from "app/admin/corporate-vehicle/corporate-vehicle.service";
import {OuNode} from "@models/ou-node.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";
import {CreateManualReviewComponent} from "@shared/create-manual-review/create-manual-review.component";

// import { concatMap, mergeMap, switchMap, map } from "rxjs/operators";

@Component({
  selector: "app-list-corporate-alerts",
  templateUrl: "./list-corporate-alerts.component.html",
  styleUrls: ["./list-corporate-alerts.component.scss"],
})
export class ListCorporateAlertsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;
  @ViewChild("createManualReview") createManualReviewComponent: CreateManualReviewComponent;
  corporateId: number;
  currentPage: number = 1;
  genericAlertsCurrentPage: number = 1;
  totalElements: number;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  alertTypes = [
    AlertType.FUEL_CONSUMPTION_LIMIT,
    AlertType.TANK_SIZE_LIMIT,
    // AlertType.OIL_CHANGE,
    AlertType.WRONG_DISTANCE_READING,
    AlertType.VEHICLE_LICENSE_EXPIRY,
  ];
  alertType: AlertType;
  corporateAlerts: CorporateAlert[] = [];
  pageSize = 10;
  genericAlertsPageSize = 10;
  isTabsView: boolean;
  userType: string;
  corporates: Corporate[] = [];
  corporatesAlerts: CorporateAlert[] = [];
  ouIds: number[] = null;
  corporateVehicles: CorporateVehicle[] = [];
  vehicleIds: number[] = [];
  ouHierarchy;
  isCollapsed: boolean;
  genericAlertTypes: GenericAlertType[] = [];
  assetId: number;
  genericAlertTypesColData: ColData[] = [
    {field: "plateNumber", header: "corporateVehicle.plateNumber"},
    {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
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

  ];

  genericAlertType: GenericAlertType;
  productCategoryId: number;
  currentReviewName: string;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateAlertService: CorporateAlertService,
    private authService: AuthService,
    private corporateService: CorporateService,
    private corporateVehicleService: CorporateVehicleService,
    public corporateOuService: CorporateOuService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.isTabsView = !!this.route.snapshot.data["view"];
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
        this.genericAlertsCurrentPage = +params.page || 1;
        this.genericAlertsPageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        if (this.userType === "master_corporate" && !this.isTabsView) {
          this.setGridData(this.corporatesAlerts);
        } else {
          this.setGridData(this.corporateAlerts);
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate') {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = [+getRelatedSystemId(params, "ouId")];
          } else {
            this.ouIds = this.authService.getOuId();
          }
        }
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin'  && this.authService.isAdminCorporateOuEnabled()) {
          this.ouIds =  this.authService.getStoredSelectedOuNodeId()  || ids.slice(0, OU_IDS_LENGTH);
        }
      })
    );
    if (this.corporateId && (this.authService.isOuEnabled() || this.authService.isAdminCorporateOuEnabled())) {
      this.getOuHierarchy();
    }
    this.getGenericAlertTypes();
  }

  setColData(lang: string) {
    this.colData = [
      this.userType === "master_corporate" &&
      this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY &&
      !this.isTabsView && {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${
          lang === "en" ? "corporates.enName" : "corporates.localeName"
        }`,
      },
      {field: "plateNumber", header: "report.vehiclePlateNumber"},
      this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
        field: "lastReadingDistance",
        header:
          this.userType === "master_corporate"
            ? "alert.lastReadingMileage"
            : "alert.lastReadingDistance",
      },
      this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
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
        field: `${
          lang === "en" ? "authorizedUserEnNames" : "authorizedUserLocaleNames"
        }`,
        header: `${
          lang === "en"
            ? "alert.authorizedUserEnNames"
            : "alert.authorizedUserLocaleNames"
        }`,
      },
      this.alertType === AlertType.OIL_CHANGE && {
        field: "lastOilChangeDate",
        header:
          this.userType === "master_corporate"
            ? "alert.lastTimeOilChange"
            : "alert.lastOilChangeDate",
      },
      this.alertType === AlertType.OIL_CHANGE && {
        field: "currentOilTravelledDistance",
        header:
          this.userType === "master_corporate"
            ? "alert.oilTravelled"
            : "alert.currentOilTravelledDistance",
      },
      this.alertType === AlertType.TANK_SIZE_LIMIT && {
        field: `${lang === "en" ? "siteEneName" : "siteLocaleName"}`,
        header: `${
          lang === "en" ? "alert.siteEneName" : "alert.siteLocaleName"
        }`,
      },
      (this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT ||
        this.userType === "master_corporate") && {
        field: "consumptionAlertType",
        header:
          this.userType === "master_corporate"
            ? "alert.alertType"
            : "alert.consumptionAlertType",
      },
      this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT && {
        field: "fuelOverConsumptionLiters",
        header: "alert.fuelOverConsumptionLiters",
      },
      this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT && {
        field: "consumptionRate",
        header: "alert.consumptionRate",
      },
      this.alertType === AlertType.TANK_SIZE_LIMIT && {
        field: "transactionDate",
        header: "alert.transactionDate",
      },
      this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
        field: "creationDate",
        header: "alert.creationDate",
      },
      this.alertType === AlertType.VEHICLE_LICENSE_EXPIRY && {
        field: "licenseExpiryDate",
        header: "alert.licenseExpiryDate",
      },
      this.alertType === AlertType.VEHICLE_LICENSE_EXPIRY && {
        field: "alertIssueDate",
        header: "alert.alertIssueDate",
      },
      this.alertType === AlertType.VEHICLE_LICENSE_EXPIRY && {
        field: "vehicleStatus",
        header: "corporateVehicle.status",
      },
    ];

    if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
      this.colData.push({field: "ouName", header: "corporateVehicle.ouName"});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }

    // if(this.alertType === AlertType.OIL_CHANGE){

    //   this.colData.push({field: "lastOilChangeDate", header: "alert.lastOilChangeDate"});
    //   this.colData.push({field: "currentOilTravelledDistance", header: "alert.currentOilTravelledDistance"});

    // } else if(this.alertType === AlertType.TANK_SIZE_LIMIT){

    //   this.colData.push({field: `${lang === "en" ? "siteEneName" : "siteLocaleName"}`, header: `${lang === "en" ? "alert.siteEneName" : "alert.siteLocaleName"}`,});

    // } else if (this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT ){

    //   this.colData.push({field: "consumptionAlertType", header: "alert.consumptionAlertType"});
    // }
  }

  getCorporateVehicles(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.Vehicle>,
    corporatesAlerts?: CorporateAlert[]
  ) {
    
    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicles(
          corporateId,
          removeNullProps({
            ...searchObj,
          }),
        )
        .subscribe(
          (corporateVehicles: BaseResponse<CorporateVehicle>) => {
            if (corporateVehicles.content?.length > 0) {
              this.corporateVehicles = corporateVehicles.content;
              this.setGridData(corporatesAlerts);
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


  getGenericAlertTypes() {
    
    this.subs.add(
      this.corporateAlertService.getGenericAlertTypes().subscribe(
        (genericAlertTypes: GenericAlertType[]) => {
          if (genericAlertTypes?.length > 0) {
            this.genericAlertTypes = genericAlertTypes;

          } else {
            this.translate
              .get(["error.noGenericAlertTypesFound", "type.warning"])
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


  getGenericAlerts(isCollapsed: boolean, type: GenericAlertType) {
    this.isCollapsed = isCollapsed;
    if (isCollapsed) return;
    
    this.subs.add(
      this.corporateAlertService.getGenericAlerts(removeNullProps({
          alertableDataId: type.alertableDataId,
          ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
          corporateIds: [this.corporateId]
        }),
        this.genericAlertsCurrentPage - 1,
        this.genericAlertsPageSize
      ).subscribe((alerts) => {
        
        if (alerts.content?.length) {
          alerts.content.forEach((alert) => {
            this.corporateVehicleService.getCorporateVehicle(this.corporateId, alert.assetId, true).subscribe((vehicle) => {
              alert['plateNumber'] = vehicle?.plateNumber;
              alert['vehicleCode'] = vehicle?.vehicleCode;
              type.data = alerts.content;
              type.totalElements = alerts.totalElements;
            })
          })

        } else {
          type.data = [];
          type.totalElements = 0;
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

  setGridData(data: CorporateAlert[]) {
    let status;
    let corporateVehicle;
    if (data) {
      this.gridData = data.map((alert) => {
        corporateVehicle = this.corporateVehicles.find((vehicle) => vehicle.id === alert.vehicleId);
        if (corporateVehicle) {
          if (corporateVehicle.suspended) {
            status = this.currentLang == "en" ? "Inactive" : "غير مفعل";
          } else if (!corporateVehicle.suspended) {
            status = this.currentLang == "en" ? "Active" : "مفعل";
          }
        } else {
          status = this.currentLang == "en" ? "Deleted" : "محذوفة";
        }

        return {
          ...(this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
            [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
              this.currentLang === "en"
                ? alert.corporateEnName
                : alert.corporateLocaleName,
          }),
          plateNumber: alert.plateNumber,
          ...(this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
            lastReadingDistance: alert.lastReadingDistance,
          }),
          ...(this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
            [`${
              this.currentLang === "en"
                ? "vehicleTypeEnName"
                : "vehicleTypeLocaleName"
            }`]:
              this.currentLang === "en"
                ? alert.vehicleTypeEnName
                : alert.vehicleTypeLocaleName,
          }),
          ...(this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY && {
            [`${
              this.currentLang === "en"
                ? "authorizedUserEnNames"
                : "authorizedUserLocaleNames"
            }`]:
              this.currentLang === "en"
                ? alert.authorizedUserEnNames
                : alert.authorizedUserLocaleNames,
          }),
          ...(this.alertType === AlertType.VEHICLE_LICENSE_EXPIRY && {
            licenseExpiryDate: alert.licenseExpiryDate.substring(0, alert.licenseExpiryDate.length - 9),
            alertIssueDate: alert.alertIssueDate.substring(0, alert.alertIssueDate.length - 9),
            [`${
              this.currentLang === "en"
                ? "authorizedUserEnNames"
                : "authorizedUserLocaleNames"
            }`]:
              this.currentLang === "en"
                ? alert.authorizedUsersEnNames
                : alert.authorizedUsersLocaleNames,
          }),

          ...(this.alertType === AlertType.OIL_CHANGE && {
            lastOilChangeDate: alert.lastOilChangeDate,
          }),
          ...(this.alertType === AlertType.OIL_CHANGE && {
            currentOilTravelledDistance: alert.currentOilTravelledDistance,
          }),

          ...(this.alertType === AlertType.TANK_SIZE_LIMIT && {
            transactionDate: alert.transactionDate,
          }),

          ...(this.alertType === AlertType.TANK_SIZE_LIMIT && {
            [`${this.currentLang === "en" ? "siteEneName" : "siteLocaleName"}`]:
              this.currentLang === "en"
                ? alert.siteEneName
                : alert.siteLocaleName,
          }),
          ...((this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT ||
            this.userType === "master_corporate") && {
            consumptionAlertType: alert.consumptionAlertType,
          }),
          ...(this.alertType === AlertType.FUEL_CONSUMPTION_LIMIT && {
            consumptionAlertType: alert.consumptionAlertType,
            fuelOverConsumptionLiters: alert.fuelOverConsumptionLiters,
            consumptionRate: alert.consumptionRate,
          }),
          vehicleStatus: status,
          creationDate: alert.creationDate,
          descrption: alert.descrption,
          ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === alert.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === alert.ouId)?.localName ?? "",
        };
      });
    } else {
      this.gridData = [];
    }
  }

  getAlerts(isCollapsed: boolean, alertType: AlertType) {
    this.isCollapsed = isCollapsed;
    if (isCollapsed) return;
    if (this.alertType != alertType) {
      this.currentPage = 1;
      this.pageSize = 10;
    }

    this.alertType = alertType;
    
    let calledFunc;
    if (this.isTabsView || this.userType === "corporate") {
      if (this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY) {
        calledFunc = this.corporateAlertService.getCorporateAlerts(
          this.corporateId,
          (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
          alertType,
          this.currentPage - 1,
          this.pageSize
        );
      } else {
        calledFunc = this.corporateAlertService.getLicenseExpiryAlert(
          [this.corporateId],
          (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
          this.currentPage - 1,
          this.pageSize
        );
      }
    } else {
      calledFunc = this.corporateAlertService.getCorporatesAlerts(
        alertType,
        (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
        this.currentPage - 1,
        this.pageSize
      );
    }
    this.subs.add(
      calledFunc.subscribe(
        async (corporateAlerts: BaseResponse<CorporateAlert>) => {
          const ouIds = [];
          if (corporateAlerts.content?.length > 0) {
            this.totalElements = corporateAlerts.totalElements;
            this.corporateAlerts = corporateAlerts.content;
            if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
              this.corporateAlerts.forEach((alert) => {
                if (alert?.ouId) {
                  ouIds.push(alert.ouId);
                }
              })
              const uniqueOuIds = [...new Set(ouIds)];
              try {
                await this.corporateOuService?.fetchOuList(this.corporateId, {ouIds: uniqueOuIds});
              } catch (error) {
                this.errorService.handleErrorResponse(error);
              }

            }

            this.vehicleIds = [...new Set(this.corporateAlerts.map((vehicle) => vehicle.vehicleId))];
            if (this.alertType === AlertType.VEHICLE_LICENSE_EXPIRY) {
              this.getCorporateVehicles(
                this.corporateId,
                {ids: this.vehicleIds},
                this.corporateAlerts
              );
            }
            if (
              this.alertType !== AlertType.VEHICLE_LICENSE_EXPIRY &&
              (this.userType !== "master_corporate" ||
                this.isTabsView)
            ) {
              this.setColData(this.currentLang)
              this.setGridData(this.corporateAlerts);
            } else {
              //  1st get corporates info
              this.getCorporates();
            }
          } else {
            this.corporateAlerts = [];
            this.totalElements = 0;
            this.setGridData(null);
            this.translate
              .get(["error.noCorporateAlerts", "type.warning"])
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

  getCorporates() {
    this.corporatesAlerts = [];
    
    this.subs.add(
      this.corporateService.getCorporates().subscribe(
        (corporates: BaseResponse<Corporate>) => {
          if (corporates.content?.length > 0) {
            this.corporates = corporates.content;
            this.corporates.forEach((corporate) => {
              this.corporateAlerts.forEach((alert) => {
                if (corporate.id === alert.corporateId) {
                  this.corporatesAlerts.push({
                    ...alert,
                    corporateEnName: corporate.enName,
                    corporateLocaleName: corporate.localeName,
                  });
                }
              });
            });
            this.setGridData(this.corporatesAlerts);
          } else {
            this.corporates = [];
            this.setGridData(null);
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


  getOuHierarchy(): void {
    let currentOuId = this.authService.getUserType() === 'corporate' ? this.authService.getOuId() : this.authService.getRootOuId();
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, currentOuId)
        .subscribe(
          (ouHierarchy) => {
            if (ouHierarchy) {
              this.ouHierarchy = ouHierarchy;
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.getAlerts(this.isCollapsed, this.alertType);
  }

  loadGenericAlertPage(page: number, genericAlertType?: GenericAlertType) {
    this.genericAlertsCurrentPage = page;
    if (genericAlertType) {
      this.getGenericAlerts(this.isCollapsed, genericAlertType)
    }
  }


  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getAlerts(this.isCollapsed, this.alertType);
  }

  handleGenericAlertsPageSizeChange(pageSize: number, genericAlertType?: GenericAlertType) {
    this.genericAlertsPageSize = pageSize;
    this.genericAlertsCurrentPage = 1;
    if (genericAlertType) {
      this.getGenericAlerts(this.isCollapsed, genericAlertType)
    }
  }

  selectOu(ouNode: OuNode, type?: GenericAlertType) {
    if (ouNode?.id !== null) {
      if (ouNode.id === 0) {
        this.ouIds = this.ouTabsComponent.ouNodes.filter(node => node.id !== 0).map(node => node.id).slice(0, OU_IDS_LENGTH);
      } else {
        this.ouIds = [ouNode.id];
      }
      if (!type) {
        this.setColData(this.currentLang);
        this.getAlerts(this.isCollapsed, this.alertType)
      } else {
        this.getGenericAlerts(this.isCollapsed, type)
      }
    }
  }

  openManualReviewModal(type: GenericAlertType) {
    this.productCategoryId = type.productCategoryId;
    this.currentReviewName = this.currentLang === 'en' ? type.enName : type.localeName;
    this.createManualReviewComponent?.manualReviewModal?.open()
  }

  setAssetId(assetId: number) {
    this.assetId = assetId;
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
