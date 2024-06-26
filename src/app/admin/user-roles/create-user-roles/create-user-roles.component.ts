import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {BaseResponse} from "../../../models/response.model";
import {RoleTag, SecurityProfile, SystemType, UserRole} from "../user-role.model";
import {UserRolesService} from "../user-role.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-user-roles",
  templateUrl: "./create-user-roles.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-user-roles.component.scss",
  ],
})
export class CreateUserRolesComponent implements OnInit, OnDestroy {
  @ViewChild("roleForm") submitForm: NgForm;
  private subs = new SubSink();
  userRole: UserRole = new UserRole();
  securityProfiles: any[];
  userRoleSecurityProfilesIds: number[] = [];
  isActive: boolean = false;
  isUpdateView: boolean;
  roleId: number;
  currentLang: string;

  systemTypes = Object.keys(SystemType).map((key) => {
    return {
      value: SystemType[key],
    };
  });

  roleTags = Object.keys(RoleTag).map((key) => {
    return {
      value: RoleTag[key],
    };
  });

  constructor(
    private route: ActivatedRoute,
    private userRoleService: UserRolesService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.isUpdateView = !!this.route.snapshot.data["view"];

    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.roleId = params["id"];
      })
    );

    if (this.isUpdateView) {
      this.getUserRoleById();
    } else {
      this.getSecurityProfiles();
    }
  }

  getUserRoleById() {
    
    this.subs.add(
      this.userRoleService.getUserRoleById(this.roleId).subscribe(
        (userRole: UserRole) => {
          this.userRole = userRole;
          this.isActive = !userRole.suspended;
          this.getSecurityProfiles();
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getSecurityProfiles() {
    
    this.subs.add(
      this.userRoleService.getSecurityProfiles({suspended: false}).subscribe(
        (data: BaseResponse<SecurityProfile>) => {
          if (data?.content?.length) {
            this.securityProfiles = data.content;
            this.userRoleSecurityProfilesIds =
              this.userRole.securityProfiles?.map((profile) => profile.id);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  createRole(formValue) {
    this.userRole.suspended = !this.isActive;
    if (this.submitForm.valid) {
      
      this.userRole.securityProfiles = this.securityProfiles.filter((profile) =>
        formValue.securityProfiles.includes(profile.id)
      );

      this.subs.add(
        this.userRoleService.createUserRole(this.userRole).subscribe(
          (role) => {
            this.translate.get("createSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, role.id);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  updateRole() {
    this.userRole.suspended = !this.isActive;
    if (this.submitForm.valid && this.userRole.id) {
      
      this.userRole.securityProfiles = this.securityProfiles.filter((profile) =>
        this.userRoleSecurityProfilesIds.includes(profile.id)
      );

      this.subs.add(
        this.userRoleService
          .updateUserRole(this.userRole.id, this.userRole)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.userRole.id);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  handleSuccessResponse(msg: string, roleId: number) {
    
    this.router.navigate(["/admin/user-roles", roleId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
