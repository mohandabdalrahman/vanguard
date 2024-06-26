import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Router } from "@angular/router";
import { differProps, PendingRequestCard } from "../pending-requests.model";
import { SystemType } from "@models/system-type";
import { PendingRequestsTabs } from "../pending-requests-tabs.model";
import { setsessionStorage , getsessionStorage} from "@helpers/session-Storage";
import {
  EntityAction,
  RejectionReason,
  WorkflowAction,
  WorkFlowDto,
} from "@models/work-flow.model";
import { MerchantProduct } from "@shared/merchant-products/merchant-product.model";
import { forkJoin } from "rxjs";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { SubSink } from "subsink";
import { ProductCategoryService } from "../../product/productCategory.service";
import { MeasurementUnitService } from "../../product/measurement-unit.service";
import { ProductTypeService } from "@shared/services/product-type.service";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { removeUnNeededProps } from "@helpers/remove-props";
import { MerchantProductService } from "@shared/merchant-products/merchant-product.service";
import { TranslateService } from "@ngx-translate/core";
import { getDifferenceProps, getSimilarProps } from "@helpers/different-props";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { ProductCategory } from "../../product/product-category.model";
import { MeasurementUnit } from "../../product/measurement-unit.model";
import { ProductType } from "@models/product-type.model";

@Component({
  selector: "app-pending-request-details",
  templateUrl: "./pending-request-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./pending-request-details.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PendingRequestDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild("acceptModal") private acceptModalComponent: ModalComponent;
  @ViewChild("rejectModal") private rejectModalComponent: ModalComponent;

  cardData: PendingRequestCard;
  systemType: SystemType;
  currentTab: PendingRequestsTabs;
  actionType: string;
  merchantProduct: MerchantProduct;
  currentLang: string;
  pendingRequestData = {};
  translateKey: string;
  numberOfChangedProps = 0;
  numberOfUnChangedProps = 0;
  differPropsMap = new Map<string, differProps>();
  productCategory: ProductCategory;
  measureUnit: MeasurementUnit;
  productType: ProductType;
  rejectionReasons: RejectionReason[] = Object.keys(RejectionReason).map(
    (key) => RejectionReason[key]
  );
  rejectionReason: RejectionReason;

  constructor(
    private router: Router,

    private toastr: ToastrService,
    private errorService: ErrorService,
    private productCategoryService: ProductCategoryService,
    private measurementUnitService: MeasurementUnitService,
    private productTypeService: ProductTypeService,
    private currentLangService: CurrentLangService,
    private merchantProductService: MerchantProductService,
    private translate: TranslateService
  ) {
    if (router.getCurrentNavigation()?.extras?.state) {
      const { cardData, currentTab, systemType } =
        router.getCurrentNavigation()?.extras?.state;
      setsessionStorage("selectedPendingCard", cardData);
      setsessionStorage("currentPendingTab", currentTab);
      setsessionStorage("systemType", systemType);
    }
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.cardData = getsessionStorage("selectedPendingCard");
    this.systemType = getsessionStorage("systemType");
    this.currentTab = getsessionStorage("currentPendingTab");
    this.actionType = this.cardData.entityAction;
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      })
    );
    switch (this.systemType) {
      case SystemType.MERCHANT: {
        this.getMerchantData();
        break;
      }
      case SystemType.CORPORATE: {
        break;
      }
      case SystemType.ADMINISTRATION: {
        break;
      }
    }
  }

  getMerchantData() {
    switch (this.currentTab) {
      case PendingRequestsTabs.PRODUCT: {
        this.translateKey = "product";
        this.merchantProduct = JSON.parse(this.cardData.entityJson);
        if (this.cardData.entityAction === EntityAction.UPDATE) {
          // first call merchant product
          const {
            relatedSystemId: merchantId,
            domainEntityId: merchantProductId,
          } = this.cardData;
          this.getMerchantProduct(merchantId, merchantProductId);
        } else {
          this.getProductData(this.merchantProduct);
        }
        break;
      }
    }
  }

  getProductData(product: MerchantProduct) {

    this.subs.add(
      forkJoin([
        this.measurementUnitService.getMeasurementUnit(
          product?.measurementUnitId
        ),
        this.productTypeService.getProductType(product?.productTypeId),
        this.productCategoryService.getProduct(product.productCategoryId),
      ]).subscribe(
        ([unit, productType, productCategory]) => {

          this.merchantProduct["unit"] =
            this.currentLang === "en"
              ? unit?.enName ?? ""
              : unit?.localeName ?? "";
          this.merchantProduct["type"] =
            this.currentLang === "en"
              ? productType?.enName ?? ""
              : productType?.localeName ?? "";
          this.merchantProduct["category.title"] =
            this.currentLang === "en"
              ? productCategory.enName
              : productCategory.localeName;
          const filteredProduct = removeUnNeededProps(product, [
            "measurementUnitId",
            "creationDate",
            "lastModifiedDate",
            "productTypeId",
            "merchantId",
            "id",
            "productCategoryId",
          ]);
          this.pendingRequestData = {
            ...filteredProduct,
            ...this.merchantProduct,
          };
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMerchantProduct(merchantId: number, merchantProductId: number) {

    this.subs.add(
      this.merchantProductService
        .getMerchantProduct(merchantId, merchantProductId)
        .subscribe(
          (merchantProduct) => {
            if (merchantProduct) {
              // this.getProductData(merchantProduct);
              // get difference between 2 objects
              let differPropsObj = getDifferenceProps<MerchantProduct>(
                this.merchantProduct,
                merchantProduct
              );
              this.checkDifferProps<MerchantProduct>(
                differPropsObj as MerchantProduct,
                merchantProduct,
                this.merchantProduct
              );
            } else {
              this.translate
                .get(["error.productNotFound", "type.warning"])
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

  checkDifferProps<T>(differPropsObj: T, originalObj: T, modifiedObj: T) {
    //check if difference between 2 objects
    const differPropsObjLength =
      Object.getOwnPropertyNames(differPropsObj).length;
    if (differPropsObjLength) {
      this.numberOfChangedProps = differPropsObjLength;
      this.numberOfUnChangedProps =
        Object.getOwnPropertyNames(originalObj).length - differPropsObjLength;

      //  get not changed props
      let similarObj = getSimilarProps(originalObj, modifiedObj);
      if (this.systemType === SystemType.MERCHANT) {
        this.getDifferProductData(differPropsObj, originalObj);
        similarObj = removeUnNeededProps(similarObj, [
          "creatorId",
          "version",
          "merchantId",
        ]);
        this.getSimilarProductData(similarObj);
      } else {
        Object.keys(differPropsObj).forEach((key) => {
          this.differPropsMap.set(key, {
            oldValue: originalObj[key],
            newValue: differPropsObj[key],
          });
        });
      }
    } else {
      this.pendingRequestData = originalObj;
    }
  }

  async getDifferProductData(differPropsObj, originalObj) {
    for (const key of Object.keys(differPropsObj)) {
      if (key === "measurementUnitId") {
        const oldUnitVal = await this.measurementUnitService
          .getMeasurementUnit(originalObj[key])
          .toPromise();
        const newUnitVal = await this.measurementUnitService
          .getMeasurementUnit(differPropsObj[key])
          .toPromise();
        this.differPropsMap.set("unit", {
          oldValue:
            this.currentLang === "en"
              ? oldUnitVal.enName
              : oldUnitVal.localeName,
          newValue:
            this.currentLang === "en"
              ? newUnitVal.enName
              : newUnitVal.localeName,
        });
      } else if (key === "productTypeId") {
        const oldProductVal = await this.productTypeService
          .getProductType(originalObj[key])
          .toPromise();
        const newProductVal = await this.productTypeService
          .getProductType(differPropsObj[key])
          .toPromise();
        this.differPropsMap.set("type", {
          oldValue:
            this.currentLang === "en"
              ? oldProductVal.enName
              : oldProductVal.localeName,
          newValue:
            this.currentLang === "en"
              ? newProductVal.enName
              : newProductVal.localeName,
        });
      } else if (key === "productCategoryId") {
        const oldCategoryVal = await this.productCategoryService
          .getProduct(originalObj[key])
          .toPromise();
        const newCategoryVal = await this.productCategoryService
          .getProduct(differPropsObj[key])
          .toPromise();
        this.differPropsMap.set("category.title", {
          oldValue:
            this.currentLang === "en"
              ? oldCategoryVal.enName
              : oldCategoryVal.localeName,
          newValue:
            this.currentLang === "en"
              ? newCategoryVal.enName
              : newCategoryVal.localeName,
        });
      } else {
        this.differPropsMap.set(key, {
          oldValue: originalObj[key],
          newValue: differPropsObj[key],
        });
      }
    }
  }

  async getSimilarProductData(similarObj: any) {
    if (similarObj.productCategoryId) {
      this.productCategory = await this.productCategoryService
        .getProduct(similarObj.productCategoryId)
        .toPromise();
      this.pendingRequestData["category.title"] =
        this.currentLang === "en"
          ? this.productCategory?.enName
          : this.productCategory?.localeName;
      delete similarObj.productCategoryId;
    }
    if (similarObj.measurementUnitId) {
      this.measureUnit = await this.measurementUnitService
        .getMeasurementUnit(similarObj?.measurementUnitId)
        .toPromise();
      this.pendingRequestData["unit"] =
        this.currentLang === "en"
          ? this.measureUnit?.enName ?? ""
          : this.measureUnit?.localeName ?? "";
      delete similarObj.measurementUnitId;
    }
    if (similarObj.productTypeId) {
      this.productType = await this.productTypeService
        .getProductType(similarObj?.productTypeId)
        .toPromise();
      this.pendingRequestData["type"] =
        this.currentLang === "en"
          ? this.productType?.enName ?? ""
          : this.productType?.localeName ?? "";
      delete similarObj.productTypeId;
    }
    this.pendingRequestData = { ...this.pendingRequestData, ...similarObj };
  }

  openAcceptModal() {
    this.acceptModalComponent.open();
  }

  openRejectModal() {
    this.rejectModalComponent.open();
  }

  submitPendingRequest() {
    this.acceptModalComponent.closeModal();
    if (this.rejectionReason) {
      this.rejectModalComponent.closeModal();
      this.cardData.rejectionReason = this.rejectionReason;
      this.cardData.workflowAction = WorkflowAction.REJECTED;
    }
    const { id: workFlowLogId, relatedSystemId: systemTypeId } = this.cardData;
    switch (this.currentTab) {
      case PendingRequestsTabs.PRODUCT: {
        this.updateWorkFlowStatus(
          this.merchantProductService,
          workFlowLogId,
          this.cardData,
          systemTypeId
        );
      }
    }
  }

  updateWorkFlowStatus(
    serviceName: any,
    workFlowLogId: number,
    workFlow: WorkFlowDto,
    systemTypeId?: number
  ) {

    if (systemTypeId) {
      this.subs.add(
        serviceName
          .updateWorkflowStatus(workFlowLogId, workFlow, systemTypeId)
          .subscribe(
            () => {

              let redirectUrl: string;
              switch (this.systemType) {
                case SystemType.MERCHANT: {
                  redirectUrl = `/admin/requests/merchants/${this.currentTab.toLowerCase()}`;
                  break;
                }
              }
              this.router.navigate([redirectUrl]);
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.subs.add(
        serviceName.updateWorkflowStatus(workFlowLogId, workFlow).subscribe(
          () => {},
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
