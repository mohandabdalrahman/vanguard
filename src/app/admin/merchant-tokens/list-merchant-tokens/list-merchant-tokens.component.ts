import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { DeleteModalComponent } from "@theme/components";
import { SubSink } from "subsink";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { EmitService } from "@shared/services/emit.service";
import { CardService } from "@shared/services/card.service";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { Card, CardGridData, CardSearch } from "@models/card.model";
import { removeNullProps } from "@helpers/check-obj";
import { BaseResponse } from "@models/response.model";
import { ColData } from "@models/column-data.model";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import {QueryParamsService} from "@shared/services/query-params.service";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: "app-list-merchant-tokens",
  templateUrl: "./list-merchant-tokens.component.html",
  styleUrls: ["../../../scss/list.style.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListMerchantTokensComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private deleteModalComponent: DeleteModalComponent;
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  @ViewChild("filterBtn") filterBtn: FilterBtnComponent;

  private subs = new SubSink();
  currentPage: number = 1;
  totalElements: number;
  merchantId: number;
  gridData: CardGridData[] = [];
  tokenId: number;
  colData: ColData[] = [
    { field: "id", header: "corporateCard.id" },
    { field: "serialNumber", header: "corporateCard.serialNumber" },
    { field: "expirationDate", header: "corporateCard.expirationDate" },
    { field: "status", header: "app.status" },
  ];
  pageSize = 10;
  destroyed = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private emitService: EmitService,
    private cardService: CardService,
    private translate: TranslateService,
    private queryParamsService: QueryParamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params.page || 1;
        this.pageSize = +params.pageSize || 10;
      }),
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.emitService.getItemId().subscribe((id) => {
        this.tokenId = id;
        this.deleteModalComponent.open();
      }),
      this.router.events.pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed)
      ).subscribe((event) => {
        if(!event['url'].includes('page')){
          this.getMerchantTokens(this.merchantId);
        }
      }),
    );
    this.getMerchantTokens(this.merchantId);
  }

  getMerchantTokens(merchantId: number, searchObj?: CardSearch) {
    
    this.subs.add(
      this.cardService
        .getCards(
          "merchant",
          merchantId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe(
          (merchantTokens: BaseResponse<Card>) => {
            if (merchantTokens?.content?.length > 0) {
              this.totalElements = merchantTokens.totalElements;
              this.gridData = merchantTokens.content.map((merchantToken) => {
                return {
                  id: merchantToken.id,
                  serialNumber: parseInt(merchantToken.serialNumber, 16) + "",
                  expirationDate: new Date(
                    merchantToken.expirationDate
                  ).toLocaleString(),
                  status: !merchantToken.suspended ? "active" : "inactive",
                };
              });
            } else {
              this.totalElements = 0;
              this.gridData = [];
              this.translate
                .get(["error.noCorporateCards", "type.warning"])
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
      this.getMerchantTokens(this.merchantId, this.submitForm?.value);
    }else{
      this.getMerchantTokens(this.merchantId);
    }
  }

  handleSearch() {
    this.currentPage = 1;
    this.getMerchantTokens(this.merchantId, this.submitForm?.value);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
