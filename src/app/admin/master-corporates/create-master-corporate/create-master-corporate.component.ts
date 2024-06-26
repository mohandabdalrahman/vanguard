import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MasterCorporate} from "../master-corporate.model";
import {MasterCorporateService} from "../master-corporate.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-create-master-corporate",
  templateUrl: "./create-master-corporate.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-master-corporate.component.scss",
  ],
})
export class CreateMasterCorporateComponent implements OnInit, OnDestroy {
  @ViewChild("createMasterCorporateForm") submitForm: NgForm;
  private subs = new SubSink();
  masterCorporate = new MasterCorporate();
  isUpdateView: boolean;
  isActive: boolean = false;
  masterCorporateId: number;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private router: Router,
    private errorService: ErrorService,
    private masterCorporateService: MasterCorporateService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isUpdateView = !!this.route.snapshot.data["view"];

    this.subs.add(
      this.route.params.subscribe((params) => {
        this.masterCorporateId = params["masterCorporateId"];
      })
    );

    if (this.isUpdateView && this.masterCorporateId) {
      this.getMasterCorporate();
    }
  }

  getMasterCorporate() {
    
    this.subs.add(
      this.masterCorporateService
        .getMasterCorporateById(this.masterCorporateId)
        .subscribe(
          (masterCorporate) => {
            if (masterCorporate) {
              this.masterCorporate = masterCorporate;
              this.isActive = !this.masterCorporate.suspended;
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

  createMasterCorporate() {
    this.masterCorporate.suspended = !this.isActive;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.masterCorporateService
          .createMasterCorporate(this.masterCorporate)
          .subscribe(
            (masterCorporate) => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, masterCorporate.id);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.warning("Please complete all required fields");
    }
  }

  updateMasterCorporate() {
    this.masterCorporate.suspended = !this.isActive;
    if (this.submitForm.valid && this.masterCorporateId) {
      
      this.subs.add(
        this.masterCorporateService
          .updateMasterCorporate(this.masterCorporateId, this.masterCorporate)
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.masterCorporateId);
                }
              );
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      this.toastr.error("Please fill all required fields", "Error");
    }
  }

  handleSuccessResponse(msg: string, masterCorporateId: number) {
    
    this.router.navigate(["/admin/master-corporates", masterCorporateId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
