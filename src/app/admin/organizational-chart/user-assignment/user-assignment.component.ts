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
import { User, UserGridData } from "@models/user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { getRelatedSystemId } from "@helpers/related-systemid";
import { CorporateUserService } from "../../corporate-user/corporate-user.service";
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
import { UserRole } from "app/admin/user-roles/user-role.model";
import { UserRolesService } from "app/admin/user-roles/user-role.service";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { DataTableComponent } from "@theme/components/data-table/data-table.component";

@Component({
  selector: 'app-user-assignment',
  templateUrl: './user-assignment.component.html',
  styleUrls: ['./user-assignment.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class UserAssignmentComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  @ViewChild("saveModel") private modalComponent: ModalComponent;
  @ViewChild("table") private table: DataTableComponent;
  @ViewChild("unitForm") submitForm: NgForm;
  @ViewChild("stepper") private stepperComponent: NbStepperComponent;
  productCategoryIds: number[] = [];
  userIds: number[] = [];
  currentLang: string;
  corporateUsers: User[] = [];
  userRoles: UserRole[] = [];
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
  openUserModal = false;
  assignAdminFlow = false;
  redirectUrl = "";
  newCreatedOuId: number;
  userId: number;
  trees = [];
  userType: string;
  colData: ColData[] = [];
  gridData: UserGridData[] = [];
  ouIds: number | number[] = null;
  selected = [];
  unitForAssignUser:number;

  constructor(
    
    private errorService: ErrorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private corporateUserService: CorporateUserService,
    private route: ActivatedRoute,
    private corporateOuService: CorporateOuService,
    private userRoleService: UserRolesService,
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
        this.setGridData(this.corporateUsers)
        this.setColData(this.currentLang)
      }),
      this.route.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.state$.subscribe((data) => {
        if (data?.id) {
          this.parentOu = data;
          this.checkOuType(this.parentOu);
          this.checkBalanceMode(this.parentOu);
          this.getCorporateUsers();
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

  getCorporateUsers() {
    

    this.subs.add(
      this.corporateUserService
        .getCorporateUsers(this.corporateId, {
          ouId: this.parentOu.id,
          suspended: false,
        })
        .subscribe(
          (corporateUsers: BaseResponse<User>) => {
            if (corporateUsers.content?.length > 0) {
              this.corporateUsers = corporateUsers.content;
              this.setGridData(this.corporateUsers)
              this.setColData(this.currentLang)
            } else {
              this.setGridData(this.corporateUsers)
              this.setColData(this.currentLang)
              this.translate
                .get(["error.noUsersFound", "type.warning"])
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
      this.getCorporateUsers();
    }
  }

  saveUserInunit(parentOu: OuNode){
    if (parentOu) {
      this.unitForAssignUser = parentOu?.id;
    } else {
      this.unitForAssignUser = null;
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
  
  setColData(lang: string) {
    this.colData = [
      {field: "id", header: "user.id"},
      {field: "status", header: "user.status"},
      {
        field: `${lang === "en" ? "enName" : "localeName"}`,
        header: `${lang === "en" ? "user.enName" : "user.localeName"}`,
        sortable: false
      },
      {field: "username", header: "app.username"},
      // {field: "email", header: "app.email"},

      {field: "userRole", header: "user.userRole", sortable: false},
      {field: "mobileNumber", header: "user.mobileNumber"},
    ];
    if ((this.corporateOuService.getOuTabsStatus() && ((this.ouIds as number[])?.length > 1)) || (this.corporateOuService.getAdminOuTabsStatus() && (this.ouIds === null || ((this.ouIds as number[])?.length > 1)))) {
      this.colData.splice(-1, 0, {field: "ouName", header: "user.ouName", sortable: false});
    } else {
      this.colData = this.colData.filter(col => col.field !== 'ouName')
    }
  }
  setGridData(data: User[]) {
    this.gridData = data.map((corporateUser) => {
      return {
        id: corporateUser.id,
        username: corporateUser.username,
        email: corporateUser.email,
        [`${this.currentLang === "en" ? "enName" : "localeName"}`]:
          this.currentLang === "en"
            ? corporateUser.enName
            : corporateUser.localeName,
        userRole: corporateUser.roles
          .map((role) => {
            return this.currentLang === "en"
              ? role?.enName ?? ""
              : ((role?.localeName ?? "") as string);
          })
          .join(", "),
        mobileNumber: corporateUser.mobileNumber,
        ouName: this.currentLang === "en" ? this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateUser.ouId)?.enName ?? "" : this.corporateOuService?.ouNames.find(ou => ou.ouId === corporateUser.ouId)?.localName ?? "",
        status: !corporateUser.suspended ? "active" : "inactive",
      };
    });
  }


  getUserRoles() {
    
    this.subs.add(
      this.userRoleService.getUserRoles().subscribe(
        (userRoles: BaseResponse<UserRole>) => {
          if (userRoles?.content?.length) {
            this.userRoles = userRoles.content;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }
  userSelected(event){
    this.selected = event;
  }

  assignUsers (assignNew:boolean=false){
    if(assignNew){
      this.subs.add(this.corporateOuService.transferUsers(this.corporateId,this.parentOu.id,this.unitForAssignUser,this.selected).subscribe(()=>{
        this.modalComponent.closeModal();
        this.selectedStep=0;
        this.table.selected=[]
        this.selected=[];
      }))
    }else{
      this.subs.add(this.corporateOuService.transferUsers(this.corporateId,this.parentOu.id,this.unitForAssignUser,this.selected).subscribe(()=>{
        this.modalComponent.closeModal()
        this.router.navigate(['/corporate','home'])
      }))
    }
 
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
