import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { PendingRequestsService } from "../pending-requests.service";
import { SubSink } from "subsink";
import { ActivatedRoute } from "@angular/router";
import { SystemType } from "@models/system-type";
import { WorkFlowDto } from "@models/work-flow.model";
import { Merchant } from "../../merchants/merchant.model";
import { MerchantUserService } from "@shared/merchant-users/merchant-user.service";
import { ErrorService } from "@shared/services/error.service";
import { PendingRequestCard } from "../pending-requests.model";
import { PendingRequestsTabs } from "../pending-requests-tabs.model";
import { AdminUserService } from "../../user-management/admin-user.service";
import { CorporateUserService } from "../../corporate-user/corporate-user.service";

@Component({
  selector: "app-list-pending-requests",
  templateUrl: "./list-pending-requests.component.html",
  styleUrls: ["./list-pending-requests.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListPendingRequestsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  currentTab: PendingRequestsTabs;
  systemType: SystemType;
  systemTypeData: WorkFlowDto[] = [];
  distinctSystemIds: number[] = [];
  distinctUserIds: number[] = [];
  distinctCreatorSystemType: string[] = [];
  distinctMerchants: Merchant[] = [];
  merchantIdWithUsersMapping = new Map<number, any[]>();
  cardData: PendingRequestCard[] = [];

  constructor(
    private pendingRequestsService: PendingRequestsService,
    private route: ActivatedRoute,
    private merchantUserService: MerchantUserService,
    private errorService: ErrorService,
    private adminUserService: AdminUserService,
    private corporateUserService: CorporateUserService
  ) {}

  ngOnInit(): void {
    this.currentTab = this.route.snapshot.data["currentTab"];
    this.systemType = this.route.parent.snapshot.data["systemType"];
    this.subs.add(
      this.pendingRequestsService.pendingLogs$.subscribe(
        async (pendingLogs) => {
          await this.getSystemTypeData(pendingLogs);
        }
      )
    );
  }

  async getSystemTypeData(pendingLogs: WorkFlowDto[]) {
    switch (this.systemType) {
      case SystemType.MERCHANT: {
        this.systemTypeData = pendingLogs.filter(
          (log) => log.systemType === SystemType.MERCHANT
        );
        this.getDistinctSystemIds(this.systemTypeData);
        this.getDistinctUserIds(this.systemTypeData);
        this.getDistinctCreatorSystemType(this.systemTypeData);
        this.getDistinctMerchants();
        await this.getUserInfo(this.systemTypeData);
        this.setCardData();
        break;
      }
      case SystemType.CORPORATE: {
        this.systemTypeData = pendingLogs.filter(
          (log) => log.systemType === SystemType.CORPORATE
        );
        this.getDistinctSystemIds(this.systemTypeData);
        this.getDistinctUserIds(this.systemTypeData);
        break;
      }
    }
  }

  getDistinctSystemIds(systemTypeData: WorkFlowDto[]) {
    const relatedSystemIds = systemTypeData.map((item) => item.relatedSystemId);
    this.distinctSystemIds = [...new Set(relatedSystemIds)];
  }

  getDistinctUserIds(systemTypeData: WorkFlowDto[]) {
    const userIds = systemTypeData.map((item) => +item.creatorId);
    this.distinctUserIds = [...new Set(userIds)];
  }

  getDistinctCreatorSystemType(systemTypeData: WorkFlowDto[]) {
    const userIds = systemTypeData.map((item) => item.creatorSystemType);
    this.distinctCreatorSystemType = [...new Set(userIds)];
  }

  getDistinctMerchants() {
    this.distinctMerchants = this.pendingRequestsService.merchants.filter(
      (merchant) => this.distinctSystemIds.includes(merchant.id)
    );
  }

  async getDistinctMerchantUsers(systemId: number) {
    try {
      const results = await this.merchantUserService
        .getMerchantUsers(systemId, { userIds: this.distinctUserIds })
        .toPromise();
      this.merchantIdWithUsersMapping.set(systemId, results.content);
    } catch (error) {
      this.errorService.handleErrorResponse(error);
    }
  }

  async getDistinctAdminUsers(systemId: number) {
    try {
      const results = await this.adminUserService
        .getAdminUsers({ userIds: this.distinctUserIds })
        .toPromise();
      this.merchantIdWithUsersMapping.set(systemId, results.content);
    } catch (error) {
      this.errorService.handleErrorResponse(error);
    }
  }

  async getDistinctCorporateUsers(systemId: number) {
    try {
      const results = await this.corporateUserService
        .getCorporatesUsers({ userIds: this.distinctUserIds })
        .toPromise();
      this.merchantIdWithUsersMapping.set(systemId, results.content);
    } catch (error) {
      this.errorService.handleErrorResponse(error);
    }
  }

  async getUserInfo(systemTypeData: WorkFlowDto[]) {
    if (!systemTypeData.length)
      return new Error("No pending requests available");
    for (const id of this.distinctSystemIds) {
      for (const type of this.distinctCreatorSystemType) {
        switch (type) {
          case SystemType.MERCHANT: {
            await this.getDistinctMerchantUsers(id);
            break;
          }
          case SystemType.ADMINISTRATION: {
            await this.getDistinctAdminUsers(id);
            break;
          }
          case SystemType.CORPORATE: {
            await this.getDistinctCorporateUsers(id);
            break;
          }
        }
      }
    }
  }

  setCardData() {
    this.cardData = [];
    this.systemTypeData.forEach((item) => {
      const merchant = this.distinctMerchants.find(
        (m) => m.id === item.relatedSystemId
      );
      const merchantUsers = this.merchantIdWithUsersMapping.get(
        item.relatedSystemId
      );
      const merchantUser = merchantUsers?.find((u) => u.id === +item.creatorId);
      this.cardData.push({
        ...item,
        requester: merchantUser?.enName,
        systemTypeName: merchant?.enName,
        userId: merchantUser?.id,
        actionType: item?.entityAction,
        date: item?.creationDate,
        status: merchant?.suspended,
      });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
