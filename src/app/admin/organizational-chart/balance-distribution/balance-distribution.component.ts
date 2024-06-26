import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {SubSink} from "subsink";
import {JSONPath} from "jsonpath-plus";
import {ErrorService} from "@shared/services/error.service";
import {CorporateOuService} from "../corporate-ou.service";
import {
  BalanceDistributionMode,
  OuBalanceDistribution,
  OuNode,
} from "../corporate-ou.model";
import {TranslateService} from "@ngx-translate/core";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {ToastrService} from "ngx-toastr";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {ActivatedRoute, Router} from "@angular/router";

type InputType = "percent" | "amount";

@Component({
  selector: "app-balance-distribution",
  templateUrl: "./balance-distribution.component.html",
  styleUrls: ["./balance-distribution.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class BalanceDistributionComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("confirmModal") private modalComponent: ModalComponent;
  tree = new OuBalanceDistribution();
  tempTree = new OuBalanceDistribution();
  currentLang: string;
  corporateId: number;
  ouId: number;
  showLoading = true;
  isSaveAction = false;
  fireChange = false;
  userType: string;

  constructor(
    private errorService: ErrorService,
    private corporateOuService: CorporateOuService,
    private translate: TranslateService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private toastr: ToastrService,

    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.corporateId = +getRelatedSystemId(null, "corporateId");
    this.ouId = this.userType === 'corporate' ? this.authService.getOuId() : this.authService.getRootOuId();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    );

    this.getOuBalanceHierarchy();
  }

  ngAfterViewInit(time = 2500): void {
    setTimeout(() => {
      const orgChartHeight = (
        document.querySelector(".ng13-org-chart-container") as HTMLDivElement
      )?.getBoundingClientRect().height;
      const orgChartWidth = (
        document.querySelector("angular-org-chart") as HTMLDivElement
      )?.getBoundingClientRect().width;
      const unitsContainer = document.querySelector(
        "#units-container"
      ) as HTMLDivElement;
      if (unitsContainer) {
        unitsContainer.style.height = orgChartHeight + 180 + "px";
        unitsContainer.style.width = orgChartWidth + 400 + "px";
        this.showLoading = false;
      }
    }, time);
  }

  getOuBalanceHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getOuBalanceHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (ouBalanceHierarchy) => {
            if (ouBalanceHierarchy) {
              ouBalanceHierarchy.cssClass = "rootLevel";
              if (ouBalanceHierarchy?.children?.length === 0) {
                ouBalanceHierarchy.cssClass = "rootLevel hasNoChildren";
              }
              ouBalanceHierarchy.children.forEach((child) => {
                child.cssClass = "firstLevel";
                child.hideChildren = true;
              });
              // in case of root node
              ouBalanceHierarchy.selfAmount =
                (ouBalanceHierarchy.bufferBalance *
                  ouBalanceHierarchy.selfPercent) /
                100;
              ouBalanceHierarchy.initialBufferBalance =
                ouBalanceHierarchy.bufferBalance;
              this.tree = ouBalanceHierarchy;
              this.tempTree = JSON.parse(JSON.stringify(ouBalanceHierarchy));
              this.setInitialOuValues(this.tree);
              this.calculateBalanceDistribution(this.tree);
              this.loopThroughChildren(this.tree.children);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  loopThroughChildren(children: any[]) {
    children.forEach((child) => {
      child.initialBufferBalance = child.bufferBalance;
      child.totalLimitPercent = 0;
      this.setInitialOuValues(child);
      if (child.children?.length > 0) {
        this.loopThroughChildren(child.children);
      }

      this.calculateBalanceDistribution(child, "percent");
    });
  }

  setInitialOuValues(node: OuBalanceDistribution) {
    let parent = this.getParentOuNode(node);
    if (parent) {
      this.resetOuValues(node, parent);
    } else {
      this.resetOuValues(node);
    }
  }

  private resetOuValues(node: OuBalanceDistribution, parent?: OuBalanceDistribution) {
    const ignoredKeys: string[] = ['initialBufferBalance', 'id', 'currentBalance', 'availableBalancePercent', 'availableBalanceAmount', 'bufferBalance', 'bufferPercent', 'selfPercent', 'selfAmount', 'numberOfByLimitChild', 'numberOfByBalanceChild', 'monthlyConsumption', 'allUnitsMonthlyConsumption'];
    for (const [key, value] of Object.entries(node)) {
      if (value === null || ((parent ? !parent?.autoDistribution : !node?.autoDistribution) && typeof value === "number" && !ignoredKeys.includes(key))) {
        node[key] = 0;
      } else if (!node?.autoDistribution) {
        node["selfPercent"] = 0;
        node["selfAmount"] = 0;
      }
    }
  }

  removeNullValues(node: OuBalanceDistribution) {
    for (const [key, value] of Object.entries(node)) {
      if (value === null) {
        node[key] = 0;
      }
    }
  }

  handleCollapse(node: OuNode) {
    node.hideChildren = !node.hideChildren;
    this.ngAfterViewInit(0);
  }

  calculateBalanceDistribution(
    node: OuBalanceDistribution,
    inputType: InputType = "percent",
    name?: string
  ) {
    this.fireChange = !!name;
    // convert each string number to number
    this.convertToNumber(node);
    if (node[name] === "" && !node[name]) {
      node[name] = 0;
    }
    if (node.type === "ROOT") {
      if (node.outputBalanceDistributionMode !== "BY_LIMIT") {
        if (inputType === "percent") {
          node.selfAmount = +(
            (node.initialBufferBalance * node.selfPercent) /
            100
          ).toFixed(5);
        } else {
          node.selfPercent = node.initialBufferBalance
            ? +((node.selfAmount / node.initialBufferBalance) * 100).toFixed(2)
            : 0;
        }
      } else {
        if (inputType === "percent") {
          node.selfAmount = +(
            (node.totalLimit * node.selfPercent) /
            100
          ).toFixed(5);
        } else {
          node.selfPercent = node.totalLimit
            ? +((node.selfAmount / node.totalLimit) * 100).toFixed(2)
            : 0;
        }
      }

      this.calculateAvailableBalance(node);
      this.calculateAvailableBalancePercent(node);
    } else {
      let parent = this.getParentOuNode(node);
      const parentDistributionBalance = parent ?
        ((parent["initialBufferBalance"] ?? 0) + (parent["inputBalance"] ?? 0) ) : null;

      if (inputType === "percent") {
        node.inputBalance = +(
          (parentDistributionBalance * node.inputBalancePercent) /
          100
        ).toFixed(5);
      } else {
        node.inputBalancePercent = parentDistributionBalance
          ? +((node.inputBalance / parentDistributionBalance) * 100).toFixed(2)
          : 0;
      }
      const selfDistributionBalance =
        (node["initialBufferBalance"] ?? 0) + (node["inputBalance"] ?? 0);
      if (
        node.outputBalanceDistributionMode !== BalanceDistributionMode.limit
      ) {
        if (inputType === "percent") {
          node.selfAmount = +(
            (selfDistributionBalance * node.selfPercent) /
            100
          ).toFixed(5);
        } else {
          if (selfDistributionBalance > 0 && node.selfAmount) {
            node.selfPercent = +(
              (node.selfAmount / selfDistributionBalance) *
              100
            ).toFixed(2);
          } else {
            node.selfPercent = 0;
          }
        }
      } else {
        if (inputType === "percent") {
          node.selfAmount = +(
            (node.totalLimit * node.selfPercent) /
            100
          ).toFixed(5);
        } else {
          node.selfPercent = node.totalLimit
            ? +((node.selfAmount / node.totalLimit) * 100).toFixed(2)
            : 0;
        }
      }

      this.calculateAvailableBalance(node);
      this.calculateAvailableBalancePercent(node);
      this.calculateTotalMonthlyLimit(node);

      if (
        node.inputBalanceDistributionMode === BalanceDistributionMode.limit &&
        node.outputBalanceDistributionMode === BalanceDistributionMode.limit
      ) {
        if (inputType === "percent") {
          node.totalLimit =
            node.totalLimit && !node.totalLimitPercent
              ? node.totalLimit
              : +(
                (parent.totalLimit * (node.totalLimitPercent ?? 0)) /
                100
              ).toFixed(2);
          node.selfAmount = +((node.selfPercent * node.totalLimit) / 100).toFixed(5);
          if (node.totalLimit) {
            node.totalLimitPercent = parent.totalLimit
              ? +((node.totalLimit / parent.totalLimit) * 100).toFixed(2)
              : 0;
          }
        } else {
          node.totalLimitPercent = parent.totalLimit
            ? +((node.totalLimit / parent.totalLimit) * 100).toFixed(2)
            : 0;
          node.selfPercent = node.totalLimit
            ? +((node.selfAmount / node.totalLimit) * 100).toFixed(2)
            : 0;
        }
      }
    }
  }

  private convertToNumber(node: OuBalanceDistribution) {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" && !isNaN(+value)) {
        node[key] = +value;
      }
    }
  }

  calculateAvailableBalance(node: OuBalanceDistribution) {
    let parent = this.getParentOuNode(node);
    if (parent) {
      this.calculateAvailableBalanceAmount(parent);
    }
    this.calculateAvailableBalanceAmount(node);
  }

  private calculateAvailableBalanceAmount(node: OuBalanceDistribution | any) {
    const distributionBalance = (node["initialBufferBalance"] ?? 0) + (node["inputBalance"] ?? 0);
    const sumOfChildrenInputBalanceAmount = node?.children.reduce((acc, child) => {
      child.inputBalance = +((distributionBalance * +child.inputBalancePercent) / 100).toFixed(5);
      return acc + Number(child.inputBalance);
    }, 0);
    const selfDistributionBalance = Number((+node["initialBufferBalance"] ?? 0) + (+node["inputBalance"] ?? 0));
    node.availableBalanceAmount = +(selfDistributionBalance - (sumOfChildrenInputBalanceAmount + node.selfAmount)).toFixed(5);
    if (node.outputBalanceDistributionMode !== BalanceDistributionMode.limit) {
      node.bufferBalance = node.availableBalanceAmount;
    }

    if (node.type !== "ROOT" && node?.children?.length && this.fireChange) {
      node.children.forEach(child => {
        this.calculateAvailableBalanceAmount(child);
      })
    }
  }

  calculateAvailableBalancePercent(node: OuBalanceDistribution) {
    let parent = this.getParentOuNode(node);
    if (parent) {
      this.calculateBalancePercent(parent);
      this.checkAvailableBalancePercent(parent);
    }

    this.calculateBalancePercent(node);
    this.checkAvailableBalancePercent(node);
  }

  private calculateBalancePercent(node: OuBalanceDistribution) {
    const sumOfChildrenInputBalancePercent = node.children.reduce((acc, child) => {
      return acc + +(child.inputBalancePercent);
    }, 0).toFixed(2)

    node.availableBalancePercent = +(
      100 -
      (+node.selfPercent + +sumOfChildrenInputBalancePercent)
    ).toFixed(2);

    if (node.outputBalanceDistributionMode !== BalanceDistributionMode.limit) {
      node.bufferPercent = node.availableBalancePercent;
    }
  }

  private checkAvailableBalancePercent(node: OuBalanceDistribution) {
    if (node.availableBalancePercent < 0) {
      this.toastr.error(
        `${
          this.currentLang === "en"
            ? "Available balance percent can not be less than 0 in unit:"
            : "لا يمكن أن تكون نسبة الرصيد المتاح أقل من 0 في الوحدة:"
        }  ${this.currentLang === "en" ? node.enName : node.localeName}`,
        `${this.currentLang === "en" ? "Error" : "خطا"}`,
        {
          closeButton: false,
          disableTimeOut: true,
        }
      );
    } else {
      this.toastr.clear();
    }
  }

  private getParentOuNode(node: OuBalanceDistribution) {
    let parent: OuBalanceDistribution = JSONPath({
      path: `$..children[?(@.id==${node.id})]^^`,
      json: this.tree,
      wrap: false,
    });
    if (Array.isArray(parent)) {
      parent = parent[0];
    }
    return parent;
  }

  calculateTotalMonthlyLimit(node: OuBalanceDistribution) {
    if (
      node?.children?.length &&
      node.outputBalanceDistributionMode === BalanceDistributionMode.limit
    ) {
      const sumOfChildrenTotalLimitPercent = node.children.reduce(
        (acc, child) => {
          return acc + Number(child.totalLimitPercent);
        },
        0
      );
      if (
        sumOfChildrenTotalLimitPercent &&
        node?.selfPercent &&
        sumOfChildrenTotalLimitPercent + Number(node.selfPercent) > 100
      ) {
        this.toastr.error(
          `${
            this.currentLang === "en"
              ? "Total balance distribution percentage must be Less than or equal 100% for By Limit OU :"
              : "يجب أن يكون إجمالي نسبة توزيع الرصيد أقل من أو يساوي 100٪:"
          }  ${this.currentLang === "en" ? node.enName : node.localeName}`,
          `${this.currentLang === "en" ? "Error" : "خطا"}`,
          {
            closeButton: false,
            disableTimeOut: true,
          }
        );
      } else {
        this.toastr.clear();
      }
    }
  }

  openConfirmModal(action: "save" | "reset") {
    this.isSaveAction = action === "save";
    this.modalComponent.open();
  }

  closeModal() {
    this.modalComponent.closeModal();
  }

  resetBalanceDistribution() {
    this.closeModal();
    this.toastr.clear();
    this.tree = JSON.parse(JSON.stringify(this.tempTree));
    this.loopThroughChildren(this.tree.children);
    this.ngAfterViewInit(0);
  }

  updateBalanceDistribution(savePercentage: boolean) {
    this.closeModal();
    this.toastr.clear();
    this.removeNullValues(this.tree);

    this.subs.add(
      this.corporateOuService
        .updateBalanceDistribution(this.corporateId, this.tree, savePercentage)
        .subscribe(
          () => {

            this.translate
              .get(["success.distributeBalance"])
              .subscribe((res) => {
                this.toastr.success(Object.values(res)[0] as string);
                setTimeout(() => {
                  this.reloadCurrentRoute()
                }, 1000);
              });
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
