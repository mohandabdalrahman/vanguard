import {
  Component,
  EventEmitter, Input, OnDestroy,
  OnInit,
  Output, SimpleChanges, ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {SubSink} from "subsink";
import {ErrorService} from "@shared/services/error.service";
import {CorporateOuService} from "../../../admin/organizational-chart/corporate-ou.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {OuBalanceDistribution} from "../../../admin/organizational-chart/corporate-ou.model";
import {TranslateService} from "@ngx-translate/core";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {OuNode} from "@models/ou-node.model";
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: "app-ou-tabs",
  templateUrl: "./ou-tabs.component.html",
  styleUrls: ["./ou-tabs.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class OuTabsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("ouHierarchyModal") hierarchyModalComponent: ModalComponent;
  @Output() onNodeSelect = new EventEmitter<OuNode>();
  @Output() ChangeView = new EventEmitter<string>();
  @Input() title: string;
  @Input() ouHierarchy: OuBalanceDistribution;
  @Input() callOuHierarchy = true;
  currentLang: string;
  corporateId: number;
  ouId: number;
  tree = new OuBalanceDistribution();
  ouNodes: OuNode[] = [];
  hasOuChildren = false;
  listCorporateOus = [];
  userType: string;
  PolicyList: boolean = false
  DefaultView: boolean = true

  @Input() ConsumptionRate: Boolean = false
  constructor(
    private errorService: ErrorService,
    public corporateOuService: CorporateOuService,
    public authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.ouId = this.authService.getStoredSelectedOuNodeId() || this.authService.getOuId() || this.authService.getRootOuId();
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.corporateOuService.listCorporateOus$.subscribe((listCorporateOus) => {
        this.setOuHierarchy(listCorporateOus);
      }),
      this.corporateOuService.selectedOuNode$.subscribe((selectedOuNode) => {
        this.selectNode(selectedOuNode)
      })
    );
    if (this.route.snapshot.data.pageTitle == "corporate policies") {
      this.PolicyList = true
    }
    // if ((this.authService.isOuEnabled() || this.authService.isAdminCorporateOuEnabled()) && this.corporateId && this.ouId && this.callOuHierarchy) {
    //   this.getOuHierarchy();
    // }
    if (this.userType === 'admin') {
      if (this.corporateOuService.listCorporateOus) {
        this.setOuHierarchy(this.corporateOuService.listCorporateOus);
      } else {
        if (this.corporateOuService.getOuTabsStatus() || this.corporateOuService.getAdminOuTabsStatus()) {
          this.getOuHierarchy();
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const ouBalanceHierarchy = changes?.ouHierarchy?.currentValue;
    if (ouBalanceHierarchy) {
      this.setOuHierarchy(ouBalanceHierarchy);
    }
  }

  getOuHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (ouHierarchy) => {
            if (ouHierarchy) {
              this.setOuHierarchy(ouHierarchy);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  private setOuHierarchy(ouHierarchy) {
    this.listCorporateOus = ouHierarchy;
    this.hasOuChildren = ouHierarchy.children.length > 0;
    if (this.hasOuChildren) {
      this.ouNodes.push({
        enName: 'All',
        localeName: 'الكل',
        type: 'all',
        id: 0,
      })
    }
    this.ouNodes.push({
      enName: ouHierarchy.enName,
      localeName: ouHierarchy.localeName,
      type: ouHierarchy.type,
      id: ouHierarchy.id,
    });
    this.flatOuNodes(ouHierarchy.children);
    const childrenOuIds = this.ouNodes.filter((node) => node.id !== 0).map((node) => node.id);
    this.corporateOuService.setChildrenOuIds(childrenOuIds);
    this.selectActiveNode();
  }

  flatOuNodes(nodes: any[]): void {
    nodes.forEach((node) => {
      this.ouNodes.push({
        enName: node.enName,
        localeName: node.localeName,
        type: node.type,
        id: node.id,
      });
      if (node.children) {
        this.flatOuNodes(node.children);
      }
    });


  }

  selectActiveNode() {
    this.ouNodes = this.ouNodes.map((node) => {
      if (this.authService.getUserType() === 'admin') {
        node.active = this.authService.getStoredSelectedOuNodeId() ? node.id === this.authService.getStoredSelectedOuNodeId() : node.id === 0;
      } else {
        node.active = this.ouId ? node.id === this.ouId : this.corporateOuService?.selectedOuNode?.id ? node.id === this.corporateOuService?.selectedOuNode?.id : node.id === 0;
      }
      if (node.active) {
        this.storeSelectedOuNode(node);
      }
      return node;
    });
  }

  selectNode(node: OuNode) {
    if (node) {
      this.storeSelectedOuNode(node);
      this.ouNodes = this.ouNodes.map((n) => {
        n.active = n.id === node.id;
        return n;
      });
      this.onNodeSelect.emit(node);
    }
  }

  private storeSelectedOuNode(node: OuNode) {
    this.corporateOuService['selectedOuNode'] = node;
    sessionStorage.setItem('selectedOuNode', JSON.stringify(node));
  }

  showGrid(Type: string) {
    this.ChangeView.emit(Type)
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
