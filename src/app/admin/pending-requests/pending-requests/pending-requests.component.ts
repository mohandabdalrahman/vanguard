import {Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SystemType} from "@models/system-type";
import {PendingLogsResponseDTO} from "@models/pending-requests.model";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {SubSink} from "subsink";
import {PendingRequestsService} from "../pending-requests.service";
import {EntityAction} from "@models/work-flow.model";

@Component({
  selector: "app-pending-requests",
  templateUrl: "./pending-requests.component.html",
  styleUrls: ["./pending-requests.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PendingRequestsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  systemType: SystemType;
  systemData: any[] = [];
  pendingRequests: PendingLogsResponseDTO;
  tabs: { path: string; count: number }[] = [];
  totalPendingRequests = 0;
  mockResponse: any = {
    pendingLogs: [
      {
        id: 85,
        workflowId: 6,
        domainEntityTypeName: "PRODUCT",
        domainEntityId: 261,
        stepNumber: 1,
        workflowStepId: 16,
        workflowAction: "APPROVED",
        entityAction: "CREATE",
        entityJson:
          '{"id":261,"suspended":false,"deleted":false,"creationDate":"25-09-2022 16:07:19","lastModifiedDate":"25-09-2022 16:07:19","creatorId":1,"version":0,"localeName":"ملح","enName":"salt","description":null,"productCategoryId":4,"merchantId":1,"valueAddedTaxPercent":null,"measurementUnitId":2,"productTypeId":1,"taxCode":null}',
        creationDate: "2022-09-25T16:07:19.526+00:00",
        lastModifiedDate: null,
        actorId: "1",
        //merchant user service
        creatorId: "2",
        systemType: "MERCHANT",
        relatedSystemId: 1,
      },
      {
        id: 86,
        workflowId: 6,
        domainEntityTypeName: "MERCHANT",
        domainEntityId: 261,
        stepNumber: 1,
        workflowStepId: 16,
        workflowAction: "APPROVED",
        entityAction: "CREATE",
        entityJson:
          '{"id":261,"suspended":false,"deleted":false,"creationDate":"25-09-2022 16:07:19","lastModifiedDate":"25-09-2022 16:07:19","creatorId":1,"version":0,"localeName":"ملح","enName":"salt","description":null,"productCategoryId":4,"merchantId":1,"valueAddedTaxPercent":null,"measurementUnitId":2,"productTypeId":1,"taxCode":null}',
        creationDate: "2022-09-25T16:07:19.526+00:00",
        lastModifiedDate: null,
        actorId: "1",
        //merchant user service
        creatorId: "3",
        systemType: "MERCHANT",
        relatedSystemId: 3,
      },
      {
        id: 86,
        workflowId: 7,
        domainEntityTypeName: "MASTER_CORPORATE",
        domainEntityId: 261,
        stepNumber: 1,
        workflowStepId: 16,
        workflowAction: "APPROVED",
        entityAction: "CREATE",
        entityJson:
          '{"id":261,"suspended":false,"deleted":false,"creationDate":"25-09-2022 16:07:19","lastModifiedDate":"25-09-2022 16:07:19","creatorId":1,"version":0,"localeName":"ملح","enName":"salt","description":null,"productCategoryId":4,"merchantId":1,"valueAddedTaxPercent":null,"measurementUnitId":2,"productTypeId":1,"taxCode":null}',
        creationDate: "2022-09-25T16:07:19.526+00:00",
        lastModifiedDate: null,
        actorId: "1",
        //merchant user service
        creatorId: "1",
        systemType: "CORPORATE",
        relatedSystemId: 1,
      },
    ],
    resourceCount: {
      PRODUCT: 1,
      MERCHANT: 2,
    },
  };

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private pendingRequestsService: PendingRequestsService
  ) {
  }

  ngOnInit(): void {
    this.systemType = this.route.snapshot.data["systemType"];
    this.subs.add(
      this.route.data.subscribe(({pendingRequests, systemData}) => {
        this.systemData = systemData?.content;
        // this.pendingRequests = this.mockResponse;
        this.getPendingLogsAndResourceCount(pendingRequests);
      })
    );

    switch (this.systemType) {
      case SystemType.MERCHANT: {
        this.pendingRequestsService.onMerchantsChange(this.systemData);
        break;
      }
      case SystemType.CORPORATE: {
        this.pendingRequestsService.onCorporatesChange(this.systemData);
        break;
      }
    }
  }

  getPendingLogsAndResourceCount(pendingRequests: PendingLogsResponseDTO) {
    if (pendingRequests?.pendingLogs && pendingRequests?.resourceCount) {
      const {pendingLogs, resourceCount} = pendingRequests;
      this.tabs = [];
      for (const key in resourceCount) {
        this.tabs.push({
          path: key,
          count: resourceCount[key],
        });
        this.totalPendingRequests += resourceCount[key];
      }
      this.pendingRequestsService.onPendingLogsChange(pendingLogs);
    } else {
      this.translate.get(["pendingRequest.finish"]).subscribe((res) => {
        this.toastr.info(Object.values(res)[0] as string);
      });
    }
  }

  getPendingRequests(
    relatedSystemId?: number,
    systemType?: SystemType,
    requestType?: EntityAction
  ) {
    
    this.subs.add(
      this.pendingRequestsService
        .getPendingRequests(relatedSystemId, systemType, requestType)
        .subscribe(
          (pendingRequests: PendingLogsResponseDTO) => {
            this.getPendingLogsAndResourceCount(pendingRequests);
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  handleSearch(searchVal) {
    let relatedSystemId;
    switch (this.systemType) {
      case SystemType.MERCHANT: {
        relatedSystemId = searchVal?.merchantId;
        break;
      }
      case SystemType.CORPORATE: {
        relatedSystemId = searchVal?.corporateId;
        break;
      }
    }
    this.getPendingRequests(
      relatedSystemId,
      this.systemType,
      searchVal.entityAction
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
