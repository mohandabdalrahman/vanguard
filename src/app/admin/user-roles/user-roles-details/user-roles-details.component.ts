import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {SecurityProfile, UserRole} from "../user-role.model";
import {UserRolesService} from "../user-role.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-user-roles-details",
  templateUrl: "./user-roles-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./user-roles-details.component.scss",
  ],
})
export class UserRolesDetailsComponent implements OnInit, OnDestroy{
  private subs = new SubSink();
  userRole: UserRole = new UserRole();
  allowedAccess: string;
  roleId: number;
  currentLang: string

  constructor(
    private route: ActivatedRoute,
    private userRoleService: UserRolesService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.roleId = params["id"];
      })
    );
    if (this.roleId) {
      this.getUserRoleById();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  getUserRoleById() {
    
    this.subs.add(
      this.userRoleService.getUserRoleById(this.roleId).subscribe(
        (userRole: UserRole) => {
          if (userRole) {
            this.userRole = userRole;
            this.allowedAccess = this.concatRoles(
              this.userRole.securityProfiles
            );
          } else {
            this.translate.get(["error.noRolesFound", "type.warning"]).subscribe(
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

  concatRoles(securityProfiles: SecurityProfile[]): string {
    const roles = [];
    for (const securityProfile of securityProfiles) {
      let role = securityProfile["value"]
        .split(" ")
        .map((word) => this.capitalizeFirstLetter(word.toLowerCase()))
        .join(" ");
      roles.push(role);
    }
    return roles.join(", ");
  }

  capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
