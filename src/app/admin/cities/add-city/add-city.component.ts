import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {City} from "../city.model";
import {CityService} from "../city.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-add-city",
  templateUrl: "./add-city.component.html",
  styleUrls: ["../../../scss/create.style.scss", "./add-city.component.scss"],
})
export class AddCityComponent implements OnInit, OnDestroy {
  @ViewChild("cityForm") submitForm: NgForm;
  private subs = new SubSink();

  city = new City();
  countryId: number;
  cityId: number;
  isUpdateView: boolean;
  active = true;

  constructor(
    private route: ActivatedRoute,
    private cityService: CityService,
    
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
        this.cityId = params["cityId"];
      })
    );

    if (this.isUpdateView) {
      this.getCity();
    }
  }

  createCity() {
    this.city.suspended = !this.active;
    if (this.submitForm.valid && this.countryId) {
      
      this.subs.add(
        this.cityService.createCity(this.countryId, this.city).subscribe(
          (city) => {
            this.translate.get("createSuccessMsg").subscribe(
              (res) => {
                this.handleSuccessResponse(res, city.id);
              }
            );
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
      );
    } else {
      this.translate.get(["error.fillMandatoryFields", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );

    }
  }

  updateCity() {
    this.city.suspended = !this.active;
    if (this.submitForm.valid && this.countryId && this.cityId) {
      
      this.subs.add(
        this.cityService
          .updateCity(this.countryId, this.cityId, this.city)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.cityId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.translate.get(["error.fillMandatoryFields", "type.error"]).subscribe(
        (res) => {
          this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
        }
      );
    }
  }

  getCity() {
    if (this.countryId && this.cityId) {
      
      this.subs.add(
        this.cityService.getCity(this.countryId, this.cityId).subscribe(
          (city) => {
            if (city) {
              this.city = city;
              this.active = !city.suspended;
            } else {
              this.translate.get(["error.noCityFound", "type.warning"]).subscribe(
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
      console.error("no countryId or cityId provided");
    }
  }

  handleSuccessResponse(msg: string, cityId: number) {
    
    this.router.navigate(["/admin/countries", this.countryId, "cities", cityId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
