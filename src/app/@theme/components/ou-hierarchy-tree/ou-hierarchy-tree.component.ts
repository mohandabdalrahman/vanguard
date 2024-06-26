import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthService} from "../../../auth/auth.service";
import {SubSink} from "subsink";
import {CorporateOuService} from "../../../admin/organizational-chart/corporate-ou.service";
import {ActivatedRoute} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ErrorService} from "@shared/services/error.service";
import {OuNode} from "@models/ou-node.model";

@Component({
  selector: 'app-ou-hierarchy-tree',
  templateUrl: './ou-hierarchy-tree.component.html',
  styleUrls: ['./ou-hierarchy-tree.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OuHierarchyTreeComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateId: number;
  ouId: number;
  listCorporateOus = [];
  userRoles: string[];
  PolicyList: boolean = false

  constructor(private authService: AuthService, private corporateOuService: CorporateOuService, private route: ActivatedRoute, private errorService: ErrorService) {
  }

  ngOnInit(): void {
    if (this.route.snapshot.data.pageTitle == "corporate policies") {
      this.PolicyList = true
    }
    this.ouId = this.authService.getOuId() || this.authService.getRootOuId();
    this.userRoles = this.authService.getLoggedInUserRoles();
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
    );
    if ((this.authService.isAdminCorporateOuEnabled() || this.authService.isOuEnabled()) && this.ouId && this.corporateId) {
      if (this.userRoles.includes('OU_BILLING_ACCOUNT_LIST')) {
        this.getOuBalanceHierarchy()
      } else {
        this.getOuHierarchy();
      }
    }
  }


  getOuHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (ouHierarchy) => {
            this.listCorporateOus = [ouHierarchy];
            this.corporateOuService.setListCorporateOus(ouHierarchy)
            this.corporateOuService.onFetchCorporateOus(ouHierarchy);

          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }


  getOuBalanceHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getOuBalanceHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (ouBalanceHierarchy) => {
            if (ouBalanceHierarchy) {
              this.listCorporateOus = [ouBalanceHierarchy];
              this.corporateOuService.setListCorporateOus(ouBalanceHierarchy)
              this.corporateOuService.onFetchCorporateOus(ouBalanceHierarchy);
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  setSelectedNode(node: OuNode) {
    if (node) {
      this.corporateOuService.setSelectedOuNode(node);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.ouId = null;
  }

}
