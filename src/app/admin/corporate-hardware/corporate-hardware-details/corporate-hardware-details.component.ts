import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {CorporateHardware} from "../corporate-hardware.model";
import {CorporateHardwareService} from "../corporate-hardware.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-corporate-hardware-details",
  templateUrl: "./corporate-hardware-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./corporate-hardware-details.component.scss",
  ],
})
export class CorporateHardwareDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateId: number;
  corporateHardwareId: number;
  corporateHardware: CorporateHardware;
  userType: string;
  currentLang: string
  isTabView: boolean = false;
  updateUrl: string;
  constructor(
    private route: ActivatedRoute,
    private corporateHardwareService: CorporateHardwareService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.userType = this.authService.getUserType();
    this.isTabView= this.route.snapshot.data["isTabView"]
    if(this.isTabView){
      this.updateUrl= this.router.url.split("/").slice(0, -1).join("/") + "/update"
    }
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.corporateHardwareId = params["corporateHardwareId"];
      })
    );
    this.showCorporateHardwareDetails();
  }

  showCorporateHardwareDetails(): void {
    
    this.subs.add(
      this.corporateHardwareService
        .getCorporateHardware(this.corporateId, this.corporateHardwareId)
        .subscribe(
          (corporateHardware: CorporateHardware) => {
            if (corporateHardware) {
              const {assetPolicies, ...other} =
                removeUnNeededProps(corporateHardware);
              this.corporateHardware = other;
            } else {
              this.translate.get(["error.noHardwareFound", "type.warning"]).subscribe(
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
