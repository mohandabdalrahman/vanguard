import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {removeUnNeededProps} from "@helpers/remove-props";
import {ErrorService} from "@shared/services/error.service";
import {Country} from "app/admin/countries/country.model";
import {CountryService} from "app/admin/countries/country.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Bank} from "../bank-account.model";
import {BankService} from "../bank.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-bank-account-details",
  templateUrl: "./bank-account-details.component.html",
  styleUrls: [
    "../../../scss/details.style.scss",
    "./bank-account-details.component.scss",
  ],
})
export class BankAccountDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  bank = {};
  bankId: number;
  currentLang: string;
  suspended: boolean;

  constructor(
    private route: ActivatedRoute,
    private bankService: BankService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private countryService: CountryService,
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
        this.bankId = params["bankId"];
      })
    );
    if (this.bankId) {
      this.showBankDetails();
    } else {
      this.toastr.error("Invalid URL", "Error");
    }
  }

  showBankDetails() {
    
    this.subs.add(
      this.bankService.getBank(this.bankId).subscribe(
        (bank: Bank) => {
          if (bank) {
            const { countryId,suspended, ...other } = removeUnNeededProps(bank);
            this.bank = other;
            this.suspended=suspended;
            this.getCountry(countryId);
          } else {
            this.translate.get(["error.noBanksFound", "type.warning"]).subscribe(
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

  getCountry(countryId: number) {
    if (countryId) {
      
      this.subs.add(
        this.countryService.getCountry(countryId).subscribe(
          (country: Country) => {
            if (country) {
              this.bank["country"] =
                  this.currentLang === "en" ? country.enName : country.localeName;
              this.translate.onLangChange.subscribe(({ lang }) => {
                this.currentLang = lang;
                this.bank["country"] =
                  this.currentLang === "en" ? country.enName : country.localeName;
              })
            } else {
              this.translate.get(["error.noCountryFound", "type.warning"]).subscribe(
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
    } else {
      console.error("no country id provided");
    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
