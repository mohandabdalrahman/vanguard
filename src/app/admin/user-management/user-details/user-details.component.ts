import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {AdminUserService} from "../admin-user.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./user-details.component.scss",
  ],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  adminUserId: number;
  adminUser = {};
  currentLang: string;
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    private adminUserService: AdminUserService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.adminUserId = params["adminUserId"];
      })
    );
    if (this.adminUserId) {
      this.showAdminUserDetails();
    } else {
      this.translate.get(["error.invalidUrl", "type.warning"]).subscribe(
        (res) => {
          this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  showAdminUserDetails(): void {
    
    this.subs.add(
      this.adminUserService.getAdminUser(this.adminUserId).subscribe(
        (adminUser) => {
          if (adminUser) {
            const {
              roles,
              suspended,
              ...other
            } = removeUnNeededProps(adminUser, ['typeId', 'relatedSystemId']);
            this.adminUser = other;
            this.suspended = suspended;
            this.assignUserRoles(roles);
            this.subs.add(
              this.translate.onLangChange.subscribe(() => {
                this.assignUserRoles(roles);
              })
            );

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

  assignUserRoles(roles): void {
    this.adminUser["userRole"] = roles
      .map((role) => {
        return this.currentLang === 'en' ? role.enName : role.localeName;
      })
      .join(", ");
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
