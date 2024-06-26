import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { BaseResponse } from "@models/response.model";

import { ErrorService } from "@shared/services/error.service";
import { SubSink } from "subsink";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { NgForm } from "@angular/forms";
import {CorporateVehicle} from "../../corporate-vehicle/corporate-vehicle.model";
import { ActivatedRoute, Router } from "@angular/router";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { CorporateVehicleService } from "../../corporate-vehicle/corporate-vehicle.service";
import { City } from "../../cities/city.model";
import {
  BalanceDistributionMode,
  CorporateOu,
  OuNode,
  OuTreeNode,
  OuType,
} from "../corporate-ou.model";
import { CorporateOuService } from "../corporate-ou.service";
import { NbStepperComponent } from "@nebular/theme/components/stepper/stepper.component";
import { AuthService } from "../../../auth/auth.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ColData } from "@models/column-data.model";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { DataTableComponent } from "@theme/components/data-table/data-table.component";
import { CorporateVehicleGridData } from "app/admin/corporate-vehicle/corporate-vehicle.model";

@Component({
  selector: 'app-asset-transfer',
  templateUrl: './asset-transfer.component.html',
  styleUrls: ['./asset-transfer.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class AssetTransferComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  @ViewChild("saveModel") private modalComponent: ModalComponent;
  @ViewChild("table") private table: DataTableComponent;
  @ViewChild("unitForm") submitForm: NgForm;
  @ViewChild("stepper") private stepperComponent: NbStepperComponent;
  productCategoryIds: number[] = [];
  //userIds: number[] = [];
  currentLang: string;
  corporateVehicles: CorporateVehicle[] = [];
  //userRoles: UserRole[] = [];
  corporateId: number;
  cities: City[] = [];
  listCorporateOus = [new OuTreeNode()];
  corporateOu = new CorporateOu();
  parentOu = new OuNode();
  ouTypes = Object.keys(OuType).map((key) => {
    return {
      value: OuType[key],
    };
  });

  balanceDistributionModes = Object.keys(BalanceDistributionMode).map((key) => {
    return {
      value: BalanceDistributionMode[key],
    };
  });
  selectedStep = 0;
  ouId: number;
  state$: Observable<any>;
  //openUserModal = false;
  //assignAdminFlow = false;
  redirectUrl = "";
  newCreatedOuId: number;
  userId: number;
  trees = [];
  userType: string;
  colData: ColData[] = [];
  gridData: CorporateVehicleGridData[] = [];
  ouIds: number | number[] = null;
  selected = [];
  unitForTransferAsset:number;

  constructor(
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateVehicleService: CorporateVehicleService,
    private route: ActivatedRoute,
    private corporateOuService: CorporateOuService,
    //private userRoleService: UserRolesService,
    private authService: AuthService,
    private router:Router
  ) { }


  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.userType = this.authService.getUserType().toUpperCase();
    if(this.userType=='ADMIN'){
      this.ouId = this.authService.getRootOuId();
    }else{
      this.ouId = this.authService.getOuId();
    }
    this.route.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");
    })
    this.state$ = this.route.paramMap.pipe(map(() => window.history.state));
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setGridData(this.corporateVehicles)
        this.setColData()
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.state$.subscribe((data) => {
        if (data?.id) {
          this.parentOu = data;
          this.checkOuType(this.parentOu);
          this.checkBalanceMode(this.parentOu);
          this.getCorporateVehicles();
          this.selectedStep = 1;
        }
      })
    );
    if (this.corporateOuService?.listCorporateOus?.children?.length) {
      this.listCorporateOus = [this.corporateOuService.listCorporateOus];
    } else {
      this.getCorporateOuHierarchy();
    }
  }

  getCorporateVehicles() {
    

    this.subs.add(
      this.corporateVehicleService
        .getCorporateVehicles(this.corporateId, {
          ouIds: [this.parentOu.id],
          suspended: false,
        })
        .subscribe(
          (corporateVehicles: BaseResponse<CorporateVehicle>) => {
            if (corporateVehicles.content?.length > 0) {
              this.corporateVehicles = corporateVehicles.content;
              this.setGridData(this.corporateVehicles)
              this.setColData()
            } else {
              this.setGridData(this.corporateVehicles)
              this.setColData()
              this.translate
                .get(["error.noVehiclesFound", "type.warning"])
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

  getCorporateOuHierarchy(): void {
    
    this.subs.add(
      this.corporateOuService
        .getCorporateOuHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (corporateOus) => {
            if (corporateOus) {
              this.listCorporateOus = [corporateOus];
            }
            
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  getSelectedOu(parentOu: OuNode) {

    if (parentOu) {
      this.parentOu = parentOu;
      this.corporateOu.parentId = parentOu?.id;
    } else {

      this.parentOu = null;
      this.corporateOu.parentId = null;
    }
  }

  checkOuType(parentOu: OuNode) {
    if (parentOu.type === OuType.branch) {
      this.corporateOu.type = OuType.branch;
    } else {
      this.corporateOu.type = "";
    }
  }

  checkBalanceMode(parentOu: any) {
    if (
      (parentOu?.outputBalanceDistributionMode ||
        parentOu?.billingAccount?.outputBalanceDistributionMode) ===
      BalanceDistributionMode.limit
    ) {
      this.corporateOu.billingAccount.outputBalanceDistributionMode =
        BalanceDistributionMode.limit;
    } else {
      this.corporateOu.billingAccount.outputBalanceDistributionMode = "";
    }
  }


  checkSelectedOu() {
    if (this.corporateOu.parentId) {
      this.stepperComponent.next();
      this.selectedStep = 1;
      this.checkOuType(this.parentOu);
      this.checkBalanceMode(this.parentOu);
      this.getCorporateVehicles();
    }
  }

  saveAssetInUnit(parentOu: OuNode){
    if (parentOu) {
      this.unitForTransferAsset = parentOu?.id;
    } else {
      this.unitForTransferAsset = null;
    }
  }

  goBack() {

    if(this.selectedStep<=0){
      this.selectedStep=0
      window.history.back();
    }else{
      this.selectedStep--;
    }

  }


  setColData() {
    this.colData = [
      {field: "id", header: "corporateVehicle.id"},
      {field: "status", header: "corporateVehicle.status"},
      {field: "plateNumber", header: "corporateVehicle.plateNumber"},
      {field: "vehicleCode", header: "corporateVehicle.vehicleCode"},
      {field: "fuelType", header: "corporateVehicle.fuelType"},
    ];
    if ((this.corporateOuService.getOuTabsStatus() && ((this.ouIds as number[])?.length > 1)) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || ((this.ouIds as number[])?.length > 1)))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "user.ouName", sortable: false});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }
  setGridData(data: CorporateVehicle[]) {
    this.gridData = data.map((corporatVehicle) => {
      return {
        id: corporatVehicle.id,
        plateNumber: corporatVehicle.plateNumber,
        status: !corporatVehicle.suspended ? "active" : "inactive",
        vehicleCode: corporatVehicle.vehicleCode,
        fuelType: $localize`fuelType.` + corporatVehicle.fuelType,

      };
    });
  }

  vehicleSelected(event){
    this.selected = event;
  }

  transferAssets (assignNew:boolean=false){
    if(assignNew){
      this.subs.add(this.corporateOuService.transferAssets(this.corporateId,this.parentOu.id,this.unitForTransferAsset,this.selected).subscribe(()=>{
        this.modalComponent.closeModal();
        this.selectedStep=0;
        this.table.selected=[]
        this.selected=[];
      }))
    }else{
      this.subs.add(this.corporateOuService.transferAssets(this.corporateId,this.parentOu.id,this.unitForTransferAsset,this.selected).subscribe(()=>{
        this.modalComponent.closeModal()
        this.router.navigate(['/corporate','home'])
      }))
    }

  }



  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
