import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {Zone} from "../zone.model";
import {ZoneService} from "../zone.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-add-zone",
  templateUrl: "./add-zone.component.html",
  styleUrls: ["../../../scss/create.style.scss", "./add-zone.component.scss"],
})
export class AddZoneComponent implements OnInit, OnDestroy {
  @ViewChild("zoneForm") submitForm: NgForm;
  private subs = new SubSink();
  zone = new Zone();

  isUpdateView: boolean;
  countryId: number;
  cityId: number;
  zoneId: number;
  active = true;

  constructor(
    private route: ActivatedRoute,
    private zoneService: ZoneService,
    
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
        this.zoneId = params["zoneId"];
      })
    );

    if (this.isUpdateView) {
      this.getZone();
    }
  }

  createZone() {
    this.zone.suspended = !this.active;
    if (this.submitForm.valid && this.countryId && this.cityId) {
      
      this.subs.add(
        this.zoneService
          .createZone(this.countryId, this.cityId, this.zone)
          .subscribe(
            (zone) => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, zone.id);
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

  updateZone() {
    this.zone.suspended = !this.active;
    if (this.submitForm.valid && this.countryId && this.cityId && this.zoneId) {
      
      this.subs.add(
        this.zoneService
          .updateZone(this.countryId, this.cityId, this.zoneId, this.zone)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.zoneId);
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

  getZone() {
    if (this.countryId && this.cityId && this.zoneId) {
      
      this.subs.add(
        this.zoneService
          .getZone(this.countryId, this.cityId, this.zoneId)
          .subscribe(
            (zone: Zone) => {
              if (zone) {
                this.zone = zone;
                this.active = !zone.suspended;
              } else {
                this.translate.get(["error.noZoneFound", "type.warning"]).subscribe(
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
      console.error("no country id or city id or zone id provided");
    }
  }

  handleSuccessResponse(msg: string, zoneId: number) {
    
    this.router.navigate([
      "/admin/countries",
      this.countryId,
      "cities",
      this.cityId,
      "zones",
      zoneId,
      'details'
    ]);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
