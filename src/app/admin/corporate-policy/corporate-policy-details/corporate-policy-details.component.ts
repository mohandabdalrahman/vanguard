import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporatePolicy, PolicyUsers} from "../corporate-policy.model";
import {CorporatePolicyService} from "../corporate-policy.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {City} from "app/admin/cities/city.model";
import {BaseResponse} from "@models/response.model";
import {Zone} from "app/admin/zones/zone.model";
import {CityService} from "app/admin/cities/city.service";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {ZoneService} from "app/admin/zones/zone.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";
import {CorporateOu} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {ColData} from "@models/column-data.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {CorporateVehicle} from "app/admin/corporate-vehicle/corporate-vehicle.model";
import {CardHolder} from "@models/card-holder.model";
import {forkJoin} from "rxjs";
import {removeUnNeededProps} from "@helpers/remove-props";

@Component({
  selector: "app-corporate-policy-details",
  templateUrl: "./corporate-policy-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-policy-details.component.scss",
  ],
})
export class CorporatePolicyDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateId: number;
  corporatePolicyId: number;
  corporatePolicy = new CorporatePolicy();
  userType: string;
  countryId: number;
  citiesIds: number[];
  zonesIds: number[];
  currentLang: string;
  suspended: boolean;
  applyTime: string;
  assetType: string;
  policyCycleType: string;
  policyType: string;
  skipMileage: boolean;
  workingDays: string[] = [];
  isTabView: boolean = false;
  updateUrl: string;
  corporateOu: CorporateOu
  Cities: string[] = []
  zones: string[] = []
  currentPage: number = 1;
  totalElements: number;
  pageSize: number = 10;
  sortDirection: string;
  sortBy: string;
  PolicyUsers: PolicyUsers[] = []
  vehicleDetails: CorporateVehicle[] = []
  userDetails: CardHolder[] = []
  Goto: string

  colData: ColData[] = [];
  gridData = [];

  details: CorporatePolicy

  progressData: any
  ouId: number


  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private corporatePolicyService: CorporatePolicyService,
    private authService: AuthService,
    private zoneService: ZoneService,
    private cityService: CityService,
    private corporateService: CorporateService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private router: Router,
    private corporateOuService: CorporateOuService,
    private queryParamsService: QueryParamsService
  ) {

  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.userType = this.authService.getUserType();
    this.isTabView = this.route.snapshot.data["isTabView"]


    if (this.isTabView) {
      this.updateUrl = this.router.url.split("/").slice(0, -1).join("/") + "/update"
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;

        this.corporateOuService.setOuName(this.corporatePolicy, this.corporateOu, this.currentLang);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");

      }),
      this.route.params.subscribe((params) => {
        this.corporatePolicyId = params["corporatePolicyId"];
      })
    );
    this.showCorporatePolicyDetails();
  }

  showCorporatePolicyDetails(): void {
    
    this.subs.add(
      this.corporatePolicyService
        .getCorporatePolicy(this.corporateId, this.corporatePolicyId)
        .subscribe(
          (corporatePolicy: CorporatePolicy) => {
            if (corporatePolicy) {
              const {
                productCategoryId,
                suspended,
                applyTime,
                assetType,
                policyCycleType,
                policyType,
                skipMileage,
                workingDays,
                ouId,
                cyclePlannedUsage,
                cycleConsumption,
                ...other
              } =
                removeUnNeededProps(corporatePolicy, ["corporateId", "id"]);
              if (policyType === "DYNAMIC") {
                // @ts-ignore
                this.corporatePolicy = {
                  enName: other.enName,
                  localeName: other.localeName,
                  description: other.description,
                }
              } else {
                this.corporatePolicy = other;
              }
              this.citiesIds = other.cities;
              this.zonesIds = other.zones;
              this.getCorporate();
              this.workingDays = workingDays;
              this.suspended = suspended;
              this.applyTime = applyTime;
              this.assetType = assetType;
              this.policyCycleType = policyCycleType;
              this.policyType = policyType;
              this.skipMileage = skipMileage;
              this.details = corporatePolicy
              this.getUsers(ouId)
              this.progressData = {
                Limit: this.details.cyclePlannedUsage,
                Expectation: {
                  PlannedUsage: cyclePlannedUsage,
                  Consumption: cycleConsumption
                }
              }
              if (ouId && this.authService.isOuEnabled()) {
                this.ouId = ouId;
                this.getCorporateOuDetails(ouId)
              }
            } else {
              this.translate.get(["error.noPoliciesFound", "type.warning"]).subscribe(
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

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.countryId = corporate.countryId;

            if (this.citiesIds.length > 0) {
              this.getPolicyCities();
            }
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getPolicyCities() {
    
    this.subs.add(
      this.cityService
        .getCities(this.countryId, {citiesIds: this.citiesIds})
        .subscribe(
          (cities: BaseResponse<City>) => {
            if (cities.content) {
              this.corporatePolicy['city'] = cities.content.map(c => this.currentLang == "en" ? c?.enName ?? "" : c?.localeName ?? "");
              this.Cities = this.corporatePolicy['city']
              this.getZone(cities.content.map(c => c.id))
            } else {

              this.translate.get(["error.noCityFound", "type.warning"]).subscribe(
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

  getCorporateOuDetails(ouId: number) {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuDetails(this.corporateId, ouId)
        .subscribe(
          (corporateOu: CorporateOu) => {
            
            this.corporateOu = corporateOu;
            this.corporateOuService.setOuName(this.corporatePolicy, this.corporateOu, this.currentLang);
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }


  getZone(citiesIds: number[]) {
    
    this.subs.add(
      this.zoneService.getZones({citiesIds: citiesIds, zoneIds: this.zonesIds, countryId: this.countryId})
        .subscribe((zone: BaseResponse<Zone>) => {
          if (zone.content) {
            this.corporatePolicy['zone'] = zone.content.map(z => this.currentLang === "en" ? z?.enName ?? "" : z?.localeName ?? "");
            this.zones = this.corporatePolicy['zone']
          } else {
            this.translate.get(["error.noZoneFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        }, err => {
          this.errorService.handleErrorResponse(err);
        })
    )
  }


  setColData() {
    if (this.details.assetType == "USER") {
      this.colData = [
        {field: "id", header: "#"},
        {field: "status", header: "app.status"},
        {field: "name", header: "app.name"},
        {field: "consumptionRate", header: "app.consumptionRate"},
        {field: "Availableforthenexttransaction", header: "app.Availableforthenexttransaction"},
        {field: "Availablefortoday", header: "app.Availablefortoday"},
      ];
    } else if (this.details.assetType == "VEHICLE") {

      this.colData = [
        {field: "id", header: "#"},
        {field: "status", header: "app.status"},
        {field: "VehiclePlateNumber", header: "cardHolder.corporateUserId"},
        {field: "consumptionRate", header: "app.consumptionRate"},
        {field: "Availableforthenexttransaction", header: "app.Availableforthenexttransaction"},
        {field: "Availablefortoday", header: "app.Availablefortoday"},
      ];
    }


  }

  setGridData(PolicyUsers: PolicyUsers[]) {

    if (this.details.assetType == 'USER') {
      const Data = []


      PolicyUsers.map((PolicyUsers) => {
        this.userDetails.find((s) => {

          if (s.id == PolicyUsers.assetId) {
            Data.push({
              id: s.id,
              status: this.userDetails.find((s) => s.id == PolicyUsers.assetId)?.suspended ? 'inactive' : 'active',

              name: this.currentLang == 'en' ?
                this.userDetails.find((s) => s.id == PolicyUsers.assetId)?.enName :
                this.userDetails.find((s) => s.id == PolicyUsers.assetId)?.localeName,

              policyType: this.policyType,
              consumptionRate: {
                Limit: this.details.amount,
                Expectation: {
                  Consumption: PolicyUsers.monthlyConsumption,
                  PlannedUsage: null,
                  cycleConsumption: PolicyUsers.cycleConsumption
                }
              },

              Availableforthenexttransaction:
                PolicyUsers.limitPerTransaction <= PolicyUsers.remainingAmount && PolicyUsers.limitPerTransaction ? PolicyUsers.limitPerTransaction : PolicyUsers.limitPerTransaction > PolicyUsers.remainingAmount && PolicyUsers.limitPerTransaction ? PolicyUsers.limitPerTransaction - PolicyUsers.remainingAmount : "corporatePolicy.Notfound",

              Availablefortoday: PolicyUsers.remainingLimitPerDay ? PolicyUsers.remainingLimitPerDay : PolicyUsers.monthlyConsumption == 0 && this.details.amount ? this.details.amount : "corporatePolicy.Notfound"

            })
          }

        })
      })
      this.gridData = Data


    } else if (this.details.assetType == 'VEHICLE') {

      const Data = []


      PolicyUsers.map((PolicyUsers) => {
        this.vehicleDetails.find((s) => {
          if (s.id == PolicyUsers.assetId) {
            Data.push({
              id: s.id,
              status: this.vehicleDetails.find((s) => s.id == PolicyUsers.assetId)?.suspended ? 'inactive' : 'active',

              VehiclePlateNumber: this.vehicleDetails.find((s) => s.id == PolicyUsers.assetId)?.plateNumber,
              policyType: this.policyType,
              consumptionRate: {
                Limit: this.details.amount,
                Expectation: {
                  Consumption: PolicyUsers.monthlyConsumption,
                  PlannedUsage: null,
                  cycleConsumption: PolicyUsers.cycleConsumption
                }
              },

              Availableforthenexttransaction: PolicyUsers.remainingAmount != null ? PolicyUsers.remainingAmount : PolicyUsers.remainingLimitPerDay != null ? PolicyUsers.remainingLimitPerDay : PolicyUsers.limitPerTransaction != null ? PolicyUsers.limitPerTransaction : "corporatePolicy.Notfound",

              Availablefortoday: PolicyUsers.remainingLimitPerDay != null ? PolicyUsers.remainingLimitPerDay : "corporatePolicy.Notfound"

            })

          }
        })
      })
      this.gridData = Data
    }


  }

  getUsers(ouId:number) {
    this.corporatePolicyService.GetPolicyUsers(this.corporateId, ouId,
      {policyIds: this.corporatePolicyId},
      this.currentPage - 1,
      this.pageSize,
      this.sortDirection,
      this.sortBy).subscribe((res: BaseResponse<PolicyUsers>) => {
      this.totalElements = res.totalElements
      this.PolicyUsers = res.content
      this.getConsumptionData(res.content)
    })
  }

  getConsumptionData(Users: PolicyUsers[]) {
    if (this.PolicyUsers.length > 0) {
      if (this.details.assetType == "USER") {
        this.subs.add(forkJoin([
          this.corporatePolicyService.getUsers(this.corporateId, {
            ids: Users.map((t) => t.assetId),
            policyIds: Users.map((t) => t.policyId),
          })
        ]).subscribe(([getUsers]) => {
          this.userDetails = getUsers.content
          this.setColData()
          this.setGridData(Users)
          this.Goto = '/corporate/card-holder'
        }))

      } else if (this.details.assetType == "VEHICLE") {

        this.subs.add(forkJoin([
          this.corporatePolicyService.GetVehicleDetail(this.corporateId, {
            ids: Users.map((t) => t.assetId),
            policyIds: Users.map((t) => t.policyId),
          })
        ]).subscribe(([getVehicle]) => {
          this.vehicleDetails = getVehicle.content
          this.setColData()
          this.setGridData(Users)
          this.Goto = '/corporate/vehicles'
        }))

      }
    }


  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = +pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {

    this.getUsers(this.ouId)

  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
