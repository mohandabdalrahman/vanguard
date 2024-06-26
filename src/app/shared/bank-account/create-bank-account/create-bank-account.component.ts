import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BaseResponse} from "@models/response.model";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Country} from "../../../admin/countries/country.model";
import {CountryService} from "../../../admin/countries/country.service";
import {Bank} from "../bank-account.model";
import {BankService} from "../bank.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-create-bank-account",
  templateUrl: "./create-bank-account.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-bank-account.component.scss",
  ],
})
export class CreateBankAccountComponent implements OnInit, OnDestroy {
  @ViewChild("bankForm") submitForm: NgForm;
  private subs = new SubSink();
  bank = new Bank();
  isUpdateView: boolean;
  countries: Country[] = [];
  bankId: number;
  active = true;
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private countryService: CountryService,
    private bankService: BankService,
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
        this.bankId = params["bankId"];
      })
    );
    this.getCountries();
    if (this.isUpdateView) {
      this.getBank();
    }
  }

  getCountries() {
    
    this.subs.add(
      this.countryService.getCountries({suspended: false}).subscribe(
        (countries: BaseResponse<Country>) => {
          if (countries.content?.length > 0) {
            this.countries = countries.content;
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
  }

  createBank() {
    this.bank.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.bankService.createBank(this.bank).subscribe(
          (bank) => {
            this.translate.get("createSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, bank.id);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  updateBank() {
    this.bank.suspended = !this.active;
    if (this.submitForm.valid && this.bankId) {
      
      this.subs.add(
        this.bankService.updateBank(this.bankId, this.bank).subscribe(
          () => {
            this.translate.get("updateSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, this.bankId);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.toastr.error("Please fill all the fields", "Error");
    }
  }

  getBank() {
    if (this.bankId) {
      
      this.subs.add(
        this.bankService.getBank(this.bankId).subscribe(
          (bank: Bank) => {
            if (bank) {
              this.bank = bank;
              this.active = !bank.suspended;
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
    } else {
      console.error("no bank id provided");
    }
  }

  handleSuccessResponse(msg: string, bankId: number) {
    
    this.router.navigate(["/admin/banks", bankId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
