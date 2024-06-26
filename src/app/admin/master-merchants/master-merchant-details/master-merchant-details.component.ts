import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MasterMerchant} from "../master-merchant.model";
import {MasterMerchantService} from "../master-merchant.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-master-merchant-details",
  templateUrl: "./master-merchant-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./master-merchant-details.component.scss",
  ],
})
export class MasterMerchantDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  masterMerchant: MasterMerchant = new MasterMerchant();
  masterMerchantId: number;
  currentLang: string;
  suspended:boolean;

  constructor(
    private route: ActivatedRoute,
    private masterMerchantService: MasterMerchantService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang()
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
      this.route.params.subscribe((params) => {
        this.masterMerchantId = params["masterMerchantId"];
      })
    );
    if (this.masterMerchantId) {
      this.getMasterMerchantById();
    } else {
      this.translate.get(["error.invalidUrl", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  getMasterMerchantById() {
    
    this.subs.add(
      this.masterMerchantService
        .getMasterMerchantById(this.masterMerchantId)
        .subscribe(
          (masterMerchant: MasterMerchant) => {
            if (masterMerchant) {
              const {countryId, merchants,suspended, ...other} =
                removeUnNeededProps(masterMerchant);
              this.masterMerchant = other;
              this.suspended=suspended;
              this.masterMerchant['merchantList'] = merchants
                .map((merchant) => {
                  return merchant.enName as string;
                })
                .join(", ");
            } else {
              this.translate.get(["error.noMasterMerchantsFound", "type.warning"]).subscribe(
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
