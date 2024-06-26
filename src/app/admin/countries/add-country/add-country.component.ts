import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Country} from "../country.model";
import {CountryService} from "../country.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-add-country",
  templateUrl: "./add-country.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./add-country.component.scss",
  ],
})
export class AddCountryComponent implements OnInit, OnDestroy {
  @ViewChild("countryForm") submitForm: NgForm;
  private subs = new SubSink();

  country = new Country();
  countryId: number;
  isUpdateView: boolean;
  active = true;

  constructor(
    private route: ActivatedRoute,
    private countryService: CountryService,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isUpdateView = !!this.route.snapshot.data["view"];
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.countryId = params["countryId"];
      })
    );
    if (this.isUpdateView) {
      this.getCountry();
    }
  }

  createCountry() {
    this.country.suspended = !this.active;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.countryService.createCountry(this.country).subscribe(
          (country) => {
            this.translate.get("createSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, country.id);
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

  updateCountry() {
    this.country.suspended = !this.active;
    if (this.submitForm.valid && this.countryId) {
      
      this.subs.add(
        this.countryService
          .updateCountry(this.countryId, this.country)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.countryId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all the required fields", "Error");
    }
  }

  getCountry() {
    if (this.countryId) {
      
      this.subs.add(
        this.countryService.getCountry(this.countryId).subscribe(
          (country: Country) => {
            if (country) {
              this.country = country;
              this.active = !this.country.suspended;
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

  handleSuccessResponse(msg: string, countryId: number) {
    
    this.router.navigate(["/admin/countries", countryId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
