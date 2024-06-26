import {Component,  OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from "@angular/router";
import {removeNullProps} from "@helpers/check-obj";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AssetType} from "@models/asset-type";
import {ColData} from "@models/column-data.model";
import {BaseResponse} from "@models/response.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EmitService} from "@shared/services/emit.service";
import {ErrorService} from "@shared/services/error.service";
import {ProductCategory} from "app/admin/product/product-category.model";
import {ProductCategoryService} from "app/admin/product/productCategory.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {DeleteModalComponent} from "@theme/components";
import {
  CorporatePolicy,
  CorporatePolicyGridData,
  CorporatePolicySearch,
  PolicyCycleType,
  PolicyType,
  WorkingDays,
} from "../corporate-policy.model";
import {CorporatePolicyService} from "../corporate-policy.service";
import {SortView} from "@models/sort-view.model";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import { filter, takeUntil} from "rxjs/operators";
import {  Subject} from "rxjs";
import {OuNode} from "@models/ou-node.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {AuthService} from "../../../auth/auth.service";
import {OuTabsComponent} from "@theme/components/ou-tabs/ou-tabs.component";
import {OU_IDS_LENGTH} from "@shared/constants";

@Component({
  selector: "app-list-corporate-policies",
  templateUrl: "./list-corporate-policies.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./list-corporate-policies.component.scss",
  ],
})
export class ListCorporatePoliciesComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;
  @ViewChild("ouTabs") ouTabsComponent: OuTabsComponent;

  private subs = new SubSink();
  corporateId: number;
  currentLang: string;
  gridData: CorporatePolicyGridData[] = [];
  PolicySearch: string = "";
  colData: ColData[] = [];
  assetTypes: AssetType[] = Object.keys(AssetType).map((key) => AssetType[key]);
  policyTypes: PolicyType[] = Object.keys(PolicyType).map(
    (key) => PolicyType[key]
  );
  policyCycleTypes: PolicyCycleType[] = Object.keys(PolicyCycleType).map(
    (key) => PolicyCycleType[key]
  );
  workingDays: WorkingDays[] = Object.keys(WorkingDays).map(
    (key) => WorkingDays[key]
  );
  corporatePolicies: CorporatePolicy[] = [];
  productCategories: ProductCategory[] = [];
  corporatePolicyId: number;
  currentPage: number = 1;
  totalElements: number;
  startFromDate: string;
  startToDate: string;
  endFromDate: string;
  endToDate: string;
  currentSearchObj: CorporatePolicySearch;
  pageSize = 10;
  sortDirection: string;
  sortBy: string;
  ouIds: number | number[] = null;
  destroyed = new Subject<any>();
  showCreateBtn: boolean = true;
  allCorporatePolicy: CorporatePolicy[]
  ShowTable = true;
  productCategoryIds: number[] = [];
  isOpened: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private corporatePolicyService: CorporatePolicyService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private productCategoryService: ProductCategoryService,
    private translate: TranslateService,
    private emitService: EmitService,
    private currentLangService: CurrentLangService,
    private queryParamsService: QueryParamsService,
    public router: Router,
    public corporateOuService: CorporateOuService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData(this.currentLang);

    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData(this.currentLang);
        this.setGridData(this.corporatePolicies);
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if (!event['url'].includes('page')) {
          this.getProductCategories();
        }
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationStart),
      ).subscribe((event) => {
        if (event['url'].split('/').length - 2 === event['url'].split('/').indexOf('details') && this.authService.getUserType() === 'admin') {
          sessionStorage.removeItem('selectedOuNode');
        } else if ((event['url'].includes('create') || event['url'].includes('update') || event['url'].includes('details'))) {
          return;
        } else {
          sessionStorage.removeItem('selectedOuNode');
        }
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        if (this.authService.getUserType() === 'corporate' && this.authService.isOuEnabled()) {
          if (this.router.url.includes('organizational-chart/units')) {
            this.ouIds = +getRelatedSystemId(params, "ouId");
          } else {
            this.ouIds = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId();
          }
          this.getProductCategories();
        }
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.corporatePolicyId = id;
        this.deleteModalComponent.open();
      }),
      this.corporateOuService.childrenOuIds$.subscribe((ids) => {
        if (this.authService.getUserType() === 'admin' && this.authService.isAdminCorporateOuEnabled()) {
          this.showCreateBtn = (Number(this.authService.getStoredSelectedOuNodeId()) && this.authService.getStoredSelectedOuNodeId() !== 0);
          this.ouIds = this.authService.getStoredSelectedOuNodeId() || ids.slice(0, OU_IDS_LENGTH);
          this.getProductCategories();
        }
      })
    );

    if (!this.authService.isOuEnabled() && !this.authService.isAdminCorporateOuEnabled()) {
      this.getProductCategories();
    }
  }

  setColData(lang: string) {
    this.colData = [
      {field: "status", header: "app.status"},
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: "corporatePolicy.policyName",
      },
      {field: "assetType", header: "corporatePolicy.assetType"},
      {field: "policyType", header: "corporatePolicy.policyType"},
      {field: "policyCycleType", header: "corporatePolicy.policyCycleType"},
      {field: "Expectation", header: "corporatePolicy.Consumption"},
      {
        field: "productCategory",
        header: "product.category.title",
        sortable: false,
      },

    ];
    if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "unit.ouName", sortable: false});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }

  setGridData(data: CorporatePolicy[]) {
    this.gridData = data.map((corporatePolicy) => {

      return {
        id: corporatePolicy.id,
        corporateId: corporatePolicy.corporateId,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? corporatePolicy.enName
            : corporatePolicy.localeName,
        assetType: $localize`app.assetType.` + corporatePolicy.assetType,
        policyType: $localize`corporatePolicy.` + corporatePolicy.policyType,
        policyCycleType: corporatePolicy.policyCycleType != null
          ? $localize`corporatePolicy.` + corporatePolicy.policyCycleType
          : $localize`corporatePolicy.Notfound`,
        productCategory:
          this.currentLang === "en"
            ? this.productCategories.find(
            (product) => product.id === corporatePolicy.productCategoryId
          )?.enName ?? ""
            : this.productCategories.find(
            (product) => product.id === corporatePolicy.productCategoryId
          )?.localeName ?? "",
        ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === corporatePolicy.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === corporatePolicy.ouId)?.localName ?? "",
        status: !corporatePolicy.suspended ? "active" : "inactive",
        Expectation: {
          PlannedUsage: corporatePolicy.monthlyPlannedUsage,
          Consumption: corporatePolicy.monthlyConsumption,
          openned: corporatePolicy.openned
        },
        Limit: corporatePolicy.amount
      };
    });

  }

  getCorporatePolicies(
    corporateId: number,
    searchObj?: CorporatePolicySearch,
  ) {
    
    this.currentSearchObj = searchObj;
    if (searchObj) {
      searchObj.startFromDate = this.startFromDate
        ? Date.parse(this.startFromDate)
        : null;
      searchObj.startToDate = this.startToDate
        ? Date.parse(this.startToDate)
        : null;
      searchObj.endFromDate = this.endFromDate
        ? Date.parse(this.endFromDate)
        : null;
      searchObj.endToDate = this.endToDate ? Date.parse(this.endToDate) : null;
    }
    this.subs.add(
      this.corporatePolicyService
        .getCorporatePolicies(
          corporateId,
          removeNullProps({
            ouIds: (this.authService.getUserType() === 'admin' && (this.corporateOuService.getSelectedOuFromStorage()?.id === 0 || !this.corporateOuService.getSelectedOuFromStorage()?.id)) ? null : this.ouIds ? this.ouIds : null,
            ...searchObj,
          }),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          async (corporatePolicies: BaseResponse<CorporatePolicy>) => {
            if (corporatePolicies.content?.length > 0) {
              const ouIds = [];
              this.totalElements = corporatePolicies.totalElements;
              this.corporatePolicies = corporatePolicies.content;
              this.isOpened = this.corporatePolicies.some(policy => policy.openned);
              if (this.corporateOuService.getOuTabsStatus() && (this.ouIds as number[])?.length > 1 || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || (this.ouIds as number[])?.length > 1))) {
                this.corporatePolicies.forEach((corporatePolicy) => {
                  if (corporatePolicy.ouId) {
                    ouIds.push(corporatePolicy.ouId);
                  }
                });
                const uniqueOuIds = [...new Set(ouIds)];
                try {
                  await this.corporateOuService.fetchOuList(this.corporateId, {ouIds: uniqueOuIds})
                } catch (err) {
                  this.errorService.handleErrorResponse(err);
                }
              }
              this.allCorporatePolicy = this.corporatePolicies
              this.setGridData(this.corporatePolicies);
            } else {
              this.corporatePolicies = [];
              this.totalElements = 0;
              this.setGridData([]);
              this.translate
                .get(["error.noPoliciesFound", "type.warning"])
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
      this.productCategoryService.getProducts().subscribe(
        (products: BaseResponse<ProductCategory>) => {
          if (products.content?.length > 0) {
            this.productCategories = products.content;
            this.getCorporatePolicies(this.corporateId);
          } else {
            this.translate
              .get(["error.noProductCategoriesFound", "type.warning"])
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

  deleteCorporatePolicy() {
    
    this.subs.add(
      this.corporatePolicyService
        .deleteCorporatePolicy(this.corporateId, this.corporatePolicyId)
        .subscribe(
          () => {
            this.deleteModalComponent.closeModal();
            this.translate.get("deleteSuccessMsg").subscribe((res) => {
              this.toastr.success(res);
            });
            this.getCorporatePolicies(this.corporateId, null);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.queryParamsService.addQueryParams("page", page);
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.queryParamsService.addQueryParams("pageSize", pageSize);
    this.currentPage = 1;
    this.handlePagination();
  }


  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getCorporatePolicies(this.corporateId, this.submitForm?.value);
    } else {
      this.getCorporatePolicies(this.corporateId, null);
    }
  }

  selectOu(ouNode: OuNode) {
    if (ouNode?.id !== null) {
      this.submitForm?.reset();
      if (ouNode.id === 0) {
        this.showCreateBtn = false;
        this.ouIds = this.ouTabsComponent.ouNodes.filter(node => node.id !== 0).map(node => node.id).slice(0, OU_IDS_LENGTH);
      } else {
        this.showCreateBtn = true;
        this.ouIds = ouNode.id;
      }
      this.setColData(this.currentLang)
      this.getCorporatePolicies(this.corporateId)
    }
  }


  handleSearch() {
    this.currentPage = 1;
    this.getCorporatePolicies(
      this.corporateId,
      this.submitForm?.value,
    );
  }


  ChangeView(event: string) {
    this.ShowTable = event != 'Grid';
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  handlePolicySearch(event: Event) {
    let target = event.target as HTMLInputElement;
    this.PolicySearch = this.currentLang == "en" ?  target.value.toLowerCase() : target.value;
    this.getCorporatePolicies(this.corporateId , {
      localeName:this.PolicySearch,
    })
  }

  selectAll(values: string[], name: string) {
    if (values.includes("selectAll")) {
      const selected = this['productCategories'].map((item) => item.id);
      this.submitForm.form.controls[name].patchValue(selected);
    }
  }
}
