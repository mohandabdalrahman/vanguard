import { LoaderService } from '@shared/services/loader.service';
import {Component, OnInit, ViewChild} from "@angular/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {AuthService} from "../../../auth/auth.service";
import {SubSink} from "subsink";
import {TranslateService} from "@ngx-translate/core";
import {ColData} from "@models/column-data.model";
import {SortView} from "@models/sort-view.model";
import {ActivatedRoute} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {CorporateCardService} from "@shared/services/corporate-card.service";
import {Card, CardSearch} from "@models/card.model";
import {removeNullProps} from "@helpers/check-obj";
import {forkJoin} from "rxjs";
import {CardHolderService} from "@shared/services/card-holder.service";
import {PolicyService} from "@shared/services/policy.service";
import {AssetType} from "@models/asset-type";
import {AssetTagService} from "@shared/services/asset-tag.service";
import {CorporateService} from "app/admin/corporates/corporate.service";
import {Policy} from "@models/policy.model";
import {AssetTag} from "@models/asset-tag";
import {Corporate} from "app/admin/corporates/corporate.model";
import {CardHolder, CardHolderGridData} from "@models/card-holder.model";
import {NgForm} from "@angular/forms";
import {CorporateAssetSearch} from "@models/corporate-asset-search.model";
import {VcardInfo} from "@theme/components/vcard/vcard.model";
import {changeCheckboxState} from "@helpers/checkbox-state";
import {PdfService} from "@shared/services/pdf.service";
import {CorporateUserService} from "app/admin/corporate-user/corporate-user.service";
import {User} from "@models/user.model";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
@Component({
  selector: "app-virtual-card-holders-list",
  templateUrl: "./virtual-card-holders-list.component.html",
  styleUrls: [
    "../../../scss/list.style.scss",
    "./virtual-card-holders-list.component.scss",
  ],
})
export class VirtualCardHoldersListComponent implements OnInit {
  @ViewChild("advanceSearchForm") submitForm: NgForm;
  private subs = new SubSink();
  currentLang: string;
  userType: string;
  colData: ColData[] = [];
  sortDirection: string;
  sortBy: string;
  corporateId: number;
  currentPage: number = 1;
  pageSize = 10;
  virtualCards: Card[];
  userAssets: CardHolder[] = [];
  corporateCardHolders: User[] = [];
  diffCorporateIds: number[] = [];
  policies: Policy[] = [];
  assetTags: AssetTag[] = [];
  corporates: Corporate[];
  gridData: CardHolderGridData[] = [];
  totalElements: number;
  allVirtualNfcIds: number[] = [];
  selectedCardHolders: any[] = [];
  selectedVcardHoldersInfo: VcardInfo[] = [];
  checkedCheckboxes: string[];
  printSelected = false;
  nfcIds: number[] = [];
  corporateIds: number[] = [];
  ouId: number;

  constructor(
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private corporateCardService: CorporateCardService,
    private LoaderService:LoaderService,
    private cardHolderService: CardHolderService,
    private policyService: PolicyService,
    private assetTagService: AssetTagService,
    private corporateService: CorporateService,
    private pdfService: PdfService,
    private corporateUserService: CorporateUserService,
    private toastr: ToastrService,
    private errorService: ErrorService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType();
    this.checkedCheckboxes = JSON.parse(
      sessionStorage.getItem("checkedCheckbox")
    );
    this.setColData();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.selectCheckboxes();
        this.gridData = [];
        this.setGridData(this.userAssets);
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
        this.ouId = +params["ouId"];
      })
    );
    this.getCorporateVirtualCards(this.corporateId, {
      virtual: true,
      suspended: false,
    });
  }

  setColData() {
    this.colData = [
      {field: "id", header: "cardHolder.id"},
      {field: "name", header: "cardHolder.name", sortable: false},
      {
        field: "userCorporateId",
        header: "cardHolder.userCorporateId",
        sortable: false,
      },
      {
        field: "assignedPolicy",
        header: "cardHolder.assignedPolicy",
        sortable: false,
      },
      {field: "assetTag", header: "cardHolder.assetTag", sortable: false},
      {field: "status", header: "cardHolder.status", sortable: false},
    ];
  }

  getCorporateVirtualCards(corporateId, searchObj?: CardSearch) {
    
    this.subs.add(
      this.corporateCardService
        .getCorporateCards(corporateId, removeNullProps(searchObj))
        .subscribe((virtualCards) => {
          if (virtualCards.content.length > 0) {
            this.virtualCards = virtualCards.content;
            this.allVirtualNfcIds = this.virtualCards.map((c) => c.id)
            this.getCardholders(corporateId, removeNullProps({
              nfcIds: this.allVirtualNfcIds,
              ouIds: this.ouId ? this.ouId : null,
            }));
          }
          
        })
    );
  }

  getCardholders(
    corporateId: number,
    searchObj?: CorporateAssetSearch<AssetType.User>
  ) {
    this.subs.add(
      this.cardHolderService
        .getCardHolders(
          corporateId,
          removeNullProps(searchObj),
          this.currentPage - 1,
          this.pageSize,
          this.sortDirection,
          this.sortBy
        )
        .subscribe(
          (userAsset) => {
            if (userAsset.content.length > 0) {
              this.userAssets = userAsset.content;
              this.totalElements = userAsset.totalElements;
              this.userAssets.forEach((CardHolder) => {
                this.corporateIds.push(CardHolder.corporateId);
              });
              this.diffCorporateIds = [...new Set(this.corporateIds)];
              this.getRestOfCardholderData(this.userAssets);
            } else {
              this.userAssets = [];
              this.gridData = [];
              this.translate
                .get(["error.noDataFound", "type.warning"])
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

  getRestOfCardholderData(data: CardHolder[]) {
    let corporateUserIds = data.map((d) => d.corporateUserId);
    this.subs.add(
      forkJoin([
        this.corporateUserService.getCorporateUsers(this.corporateId, {
          userIds: corporateUserIds,
        }),
        this.policyService.getUnsuspendedPolicies(this.corporateId, {
          assetType: AssetType.User,
        }),
        this.assetTagService.getAssetTags(this.corporateId),
        this.corporateService.getCorporates({ids: this.diffCorporateIds}),
      ]).subscribe(
        ([corporateCardHolders, policies, assetTags, corporates]) => {
          this.corporateCardHolders = corporateCardHolders.content;
          this.corporateCardHolders.forEach((cardHolder) =>
            cardHolder.nfcIds.forEach((nfcId) => this.nfcIds.push(nfcId))
          );
          this.policies = policies["content"];
          this.assetTags = assetTags.content;
          this.corporates = corporates.content;
          this.setGridData(data);
          this.selectCheckboxes();
        }
      )
    );
  }

  setGridData(data: CardHolder[]) {
    this.gridData = [];
    data.forEach((cardHolder) => {
      let userNfcIds = this.corporateCardHolders?.find(
        (corporateCardHolder) =>
          corporateCardHolder.id == cardHolder.corporateUserId
      )?.nfcIds;
      this.gridData.push({
        id: cardHolder.id,
        name:
          this.currentLang === "en"
            ? cardHolder.enName ?? ""
            : cardHolder.localeName ?? "",
        status: !cardHolder.suspended ? "active" : "inactive",
        userCorporateId: cardHolder.corporateUserId,
        assignedPolicy:
          this.currentLang === "en"
            ? this.policies
              .filter((p) =>
                cardHolder.assetPolicies.map((a) => a.policyId).includes(p.id)
              )
              .map((p) => p.enName)
              .join(", ")
            : this.policies
              .filter((p) =>
                cardHolder.assetPolicies.map((a) => a.policyId).includes(p.id)
              )
              .map((p) => p.localeName)
              .join(", "),
        assetTag: this.assetTags?.find((a) => a.id == cardHolder.assetTagId)
          ?.enName,
        virtualSerialNumber: this.virtualCards?.find(
          (virtualCard) =>
            virtualCard.id ==
            userNfcIds?.find((nfcId) => nfcId == virtualCard.id)
        )?.serialNumber,
        cardHolderEnName: cardHolder.enName,
        cardHolderLocalName: cardHolder.localeName,
        corporateId: cardHolder.corporateId,
        settled:this.selectedCardHolders.find((e)=>e.id===cardHolder.id)? true:false
      });
    });
  }

  onItemSelect(selectedRecords: CardHolderGridData[]) {
    this.selectedCardHolders = Object.assign([], selectedRecords);
    this.selectedVcardHoldersInfo = this.selectedCardHolders.map(
      (cardHolder) => {
        return {
          cardHolderEnName: cardHolder.cardHolderEnName,
          cardHolderLocalName: cardHolder.cardHolderLocalName,
          serialNumber: cardHolder.virtualSerialNumber,
          corporateId: cardHolder.corporateId,
          companyEnName: this.corporates.find(
            (corporate) => corporate.id == cardHolder.corporateId
          )?.enName,
          companyLocalName: this.corporates.find(
            (corporate) => corporate.id == cardHolder.corporateId
          )?.localeName,
        };
      }
    );
    this.checkedCheckboxes = JSON.parse(
      sessionStorage.getItem("checkedCheckbox")
    );
  }

  selectCheckboxes() {
    setTimeout(() => {
      changeCheckboxState(
        Array.from(document.querySelectorAll("input[type=checkbox]")),
        this.checkedCheckboxes
      );
    }, 1500);
  }

  print() {
    if (this.selectedVcardHoldersInfo.length) {
      this.LoaderService.setLoading(true);
      this.printSelected = true;
      const printableVirtualCardHolders = document.getElementById(
        "printableVirtualCards"
      );
      if (printableVirtualCardHolders) {
        setTimeout(() => {
          this.pdfService.exportAsPDF(
            printableVirtualCardHolders,
            "virtual-Cards",
            false
          );
        }, 1000);
      }
      setTimeout(() => {
        this.printSelected = false;
        this.LoaderService.setLoading(false)
        this.translate.get(["success.dataDownloaded"]).subscribe((res) => {
          this.toastr.success(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
      }, 2000);
    } else {
      this.translate
        .get(["error.askUserToSelect", "type.warning"])
        .subscribe((res) => {
          this.toastr.warning(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  handlePagination() {
    if (this.submitForm?.value && this.submitForm?.submitted) {
      this.getCardholders(this.corporateId, {
        ...this.submitForm.value,
        nfcIds: this.allVirtualNfcIds,
      });
    } else {
      this.getCardholders(this.corporateId, {
        nfcIds: this.allVirtualNfcIds,
      });
    }
    this.selectCheckboxes();
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.handlePagination();
  }

  handlePageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.handlePagination();
  }

  handleSearch() {
    this.currentPage = 1;
    this.getCardholders(this.corporateId, {
      ...this.submitForm.value,
      nfcIds: this.allVirtualNfcIds,
    });
  }

  handleSortViewChange(sortView: SortView) {
    this.sortDirection = sortView.sortDirection;
    this.sortBy = sortView.sortBy;
    this.handlePagination();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
