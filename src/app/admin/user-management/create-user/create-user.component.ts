import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "@models/user.model";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {AdminUserService} from "../admin-user.service";
import {SystemType} from "../../user-roles/user-role.model";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {EMAIL_REGEX, USERNAME_REGEX} from "@shared/constants";

@Component({
  selector: "app-create-user",
  templateUrl: "./create-user.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-user.component.scss",
  ],
})
export class CreateUserComponent implements OnInit, OnDestroy {
  @ViewChild("adminUserForm") submitForm: NgForm;
  private subs = new SubSink();
  isUpdateView: boolean;
  adminUser = new User();
  adminUserId: number;
  // TODO: ADD ROLE interface
  roles: any[] = [];
  rolesId: number[] = [];
  active = true;
  selectedRoles: number[] = [];
  currentLang: string;
  EMAIL_REGEX = EMAIL_REGEX;
  USERNAME_REGEX = USERNAME_REGEX;

  constructor(
    private route: ActivatedRoute,
    private adminUserService: AdminUserService,
    
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
        this.adminUserId = params["adminUserId"];
      })
    );
    this.getUserRoles();
    if (this.isUpdateView && this.adminUserId) {
      this.getAdminUser();
    }
  }

  createAdminUser() {
    this.adminUser.roles = this.roles.filter((role) =>
      this.selectedRoles.includes(role.id)
    );
    this.adminUser.suspended = !this.active;
    this.adminUser.enName = `${this.adminUser.fEnName} ${this.adminUser.mEnName} ${this.adminUser.lEnName}`;
    this.adminUser.localeName = `${this.adminUser.fLocaleName} ${this.adminUser.mLocaleName} ${this.adminUser.lLocaleName}`;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.adminUserService.createAdminUser(this.adminUser).subscribe(
          (user) => {
            this.translate.get("createSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, user.id);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  updateAdminUser() {
    this.adminUser.roles = this.roles.filter((role) =>
      this.selectedRoles.includes(role.id)
    );
    this.adminUser.suspended = !this.active;
    if (this.submitForm.valid && this.adminUserId) {
      
      this.subs.add(
        this.adminUserService
          .updateAdminUser(this.adminUserId, this.adminUser)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.adminUserId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  getAdminUser() {
    
    this.subs.add(
      this.adminUserService.getAdminUser(this.adminUserId).subscribe(
        (adminUser) => {
          if (adminUser) {
            this.adminUser = adminUser;
            this.active = !this.adminUser.suspended;
            this.selectedRoles = adminUser.roles.map((role) => role.id);
          } else {
            this.translate.get(["error.noUsersFound", "type.warning"]).subscribe(
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

  getUserRoles() {
    
    this.subs.add(
      this.adminUserService
        .getUserRoles({suspended: false})
        .subscribe((roles) => {
          if (roles?.content?.length > 0) {
            this.roles = roles.content.filter(
              (role) => role.systemType === SystemType.Admin
            );
          } else {
            this.translate.get(["error.noRolesFound", "type.warning"]).subscribe(
              (res) => {
                this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
              }
            );
          }
          
        })
    );
  }

  handleSuccessResponse(msg: string, userId: number) {
    
    this.router.navigate(["/admin/users", userId, 'details']);
    this.toastr.success(msg);
  }

  usernameValidation(event) {
    return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode >= 48 && event.charCode <= 57);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
