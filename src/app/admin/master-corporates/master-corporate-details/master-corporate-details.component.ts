import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MasterCorporate} from "../master-corporate.model";
import {MasterCorporateService} from "../master-corporate.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-master-corporate-details",
  templateUrl: "./master-corporate-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./master-corporate-details.component.scss",
  ],
})
export class MasterCorporateDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  masterCorporate : MasterCorporate;
  masterCorporateId: number;
  currentLang: string;
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private masterCorporateService: MasterCorporateService,
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
        this.masterCorporateId = params["masterCorporateId"];
      })
    );

    if (this.masterCorporateId) {
      this.showMasterCorporateDetails();
    }
  }

  showMasterCorporateDetails(): void {
    
    this.subs.add(
      this.masterCorporateService
        .getMasterCorporateById(this.masterCorporateId)
        .subscribe(
          (masterCorporate: MasterCorporate) => {
            if (masterCorporate) {
              const {
                suspended,
                ...other
              } = removeUnNeededProps(masterCorporate);
              this.masterCorporate = other
              this.suspended = suspended 
            } else {
              this.translate.get(["error.noMasterCorporatesFound", "type.warning"]).subscribe(
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
