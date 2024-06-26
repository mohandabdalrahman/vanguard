import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { TranslateService } from "@ngx-translate/core";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { SubSink } from "subsink";

import { ErrorService } from "@shared/services/error.service";
import { ToastrService } from "ngx-toastr";
import {
  CorporateOuBrief,
  PolicyCountResponseDto,
} from "../../../admin/organizational-chart/corporate-ou.model";
import { CorporateOuService } from "../../../admin/organizational-chart/corporate-ou.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: "app-details-drawer",
  templateUrl: "./details-drawer.component.html",
  styleUrls: ["./details-drawer.component.scss"],
})
export class DetailsDrawerComponent implements OnInit {
  private subs = new SubSink();
  currentLang: string;
  @Output() onCloseDrawer = new EventEmitter();
  @Input() node: any;
  @Input() showDrawer: boolean;
  corporateId: number;
  corporateOuBrief: CorporateOuBrief;
  ouId: number;
  policyCount: PolicyCountResponseDto;

  constructor(
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    public corporateOuService: CorporateOuService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.corporateId = +getRelatedSystemId(null, "corporateId");
    this.subs.add(
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang;
    }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      })
    )
    if (this.showDrawer) {
      this.getCorporateOuBrief();
      this.getPolicyCount();
    }
  }

  closeDrawer() {
    this.onCloseDrawer.emit();
  }


  getCorporateOuBrief(): void {
    
    this.subs.add(
      this.corporateOuService.getCorporateOuBrief(this.corporateId, this.node.id).subscribe(
        (corporateOuBreif) => {
          if (corporateOuBreif) {
            this.corporateOuBrief = corporateOuBreif;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getPolicyCount(): void {
    
    this.subs.add(
      this.corporateOuService
        .getPolicyCount(this.corporateId, [this.node.id])
        .subscribe(
          (policyCount) => {
            if (policyCount) {
              this.policyCount = policyCount;
              this.corporateOuService.setPolicyCount(policyCount);
            }
            
          },
          (err) => {
            this.corporateOuService.setPolicyCount(null);
            if (
              err?.includes("Backend returned code 404: No Policies found.")
            ) {
              this.translate.get(["errorCode.POL_NF"]).subscribe((res) => {
                this.toastr.warning(Object.values(res)[0] as string);
              });
            } else {
              this.errorService.handleErrorResponse(err);
            }
          }
        )
    );
  }

}
