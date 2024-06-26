import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {CorporateVehicleService} from "../../admin/corporate-vehicle/corporate-vehicle.service";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";
import {ErrorService} from "@shared/services/error.service";
import {SubSink} from "subsink";
import {CorporateVehicle, ManualReview} from "../../admin/corporate-vehicle/corporate-vehicle.model";
import {formatDate} from "@helpers/format-date";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {BaseResponse} from "@models/response.model";

type ReadingDistanceType = "currentDistance" | "lastDistance";

@Component({
  selector: 'app-create-manual-review',
  templateUrl: './create-manual-review.component.html',
  styleUrls: ['./create-manual-review.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CreateManualReviewComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild('manualReviewModal') manualReviewModal: ModalComponent;
  @Input() corporateVehicle: CorporateVehicle;
  @Input() corporateId: number;
  @Input() productCategoryId: number;
  @Input() ouId;
  @Input() currentReviewName: string;
  @Input() showVehicles = false;
  @Output() onAssetIdChange = new EventEmitter<number>();
  manualReview = new ManualReview();
  corporateVehicles: CorporateVehicle[] = [];
  currentReadingDistance: "currentDistance" | "lastDistance" = "currentDistance"
  currentDistanceValue = null
  assetId: number = null;
  reviewDate;


  constructor(
    
    private corporateVehicleService: CorporateVehicleService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private errorService: ErrorService,
  ) {
  }

  ngOnInit(): void {
    if (this.showVehicles && this.corporateId) {
      this.getCorporateVehicles(this.corporateId);
    }
  }


  createManualReview(): void {
    
    this.setCurrentDistanceValue(this.currentReadingDistance)
    this.manualReview.productCategoryId = this.productCategoryId;
    this.manualReview.assetId = this.corporateVehicle?.id || this.assetId;
    this.subs.add(
      this.corporateVehicleService.createManualReview(this.corporateId, this.ouId, this.manualReview.assetId, this.manualReview).subscribe(() => {
        
        this.manualReviewModal.closeModal();
        this.translate.get(['success.manualReviewCreated']).subscribe((res) => {
          this.toastr.success(Object.values(res)[0] as string);
        })
      }, (err) => {
        this.errorService.handleErrorResponse(err);
      })
    )
  }


  handleCurrentDistance(readingDistance: ReadingDistanceType) {
    this.currentReadingDistance = readingDistance;
    this.setCurrentDistanceValue(readingDistance);
  }

  private setCurrentDistanceValue(readingDistance: ReadingDistanceType) {
    if (readingDistance === 'lastDistance') {
      this.manualReview.currentReadingDistance = this.corporateVehicle.lastDistanceReading;
      this.currentDistanceValue = null
      this.manualReview.maunalReviewDate = null;
    } else {
      this.manualReview.currentReadingDistance = this.currentDistanceValue;
      this.manualReview.maunalReviewDate = formatDate(this.reviewDate);
    }
  }


  resetManualReviewModal() {
    this.manualReview = new ManualReview();
    this.currentDistanceValue = null;
    this.reviewDate = null;
    this.currentReadingDistance = "currentDistance";
  }


  getCorporateVehicles(corporateId: number) {
    
    this.subs.add(
      this.corporateVehicleService.getCorporateVehicles(corporateId).subscribe(
        (corporateVehicles: BaseResponse<CorporateVehicle>) => {
          if (corporateVehicles.content?.length > 0) {
            this.corporateVehicles = corporateVehicles.content;
          } else {
            this.translate.get(["error.noVehiclesFound", "type.warning"]).subscribe(
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

  handleAssetId(assetId: number) {
    this.onAssetIdChange.emit(assetId);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
