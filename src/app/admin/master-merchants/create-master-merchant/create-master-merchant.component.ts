import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ErrorService} from "@shared/services/error.service";
import {ToastrService} from "ngx-toastr";
import {SubSink} from "subsink";
import {MasterMerchant} from "../master-merchant.model";
import {MasterMerchantService} from "../master-merchant.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-create-master-merchant",
  templateUrl: "./create-master-merchant.component.html",
  styleUrls: [
    "../../../scss/create.style.scss",
    "./create-master-merchant.component.scss",
  ],
})
export class CreateMasterMerchantComponent implements OnInit, OnDestroy {
  @ViewChild("createMasterMerchantForm") submitForm: NgForm;
  private subs = new SubSink();
  masterMerchant: MasterMerchant = new MasterMerchant();
  isUpdateView: boolean;
  isActive: boolean = false;
  masterMerchantId: number;
  currentBalance:number;

  constructor(
    private route: ActivatedRoute,
    private masterMerchantService: MasterMerchantService,
    
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
        this.masterMerchantId = params["masterMerchantId"];
      })
    );

    if (this.isUpdateView) {
      this.getMasterMerchant();
    }
  }

  getMasterMerchant() {
    if (this.masterMerchantId) {
      
      this.subs.add(
        this.masterMerchantService
          .getMasterMerchantById(this.masterMerchantId)
          .subscribe(
            (masterMerchant: MasterMerchant) => {
              
              this.masterMerchant = masterMerchant;
              this.currentBalance = masterMerchant.balance;
              this.isActive = !masterMerchant.suspended;
            },
            (err) => {
              this.errorService.handleErrorResponse(err);
            }
          )
      );
    } else {
      console.error("no masterMerchant id provided");
    }
  }

  createMasterMerchant() {
    this.masterMerchant.suspended = !this.isActive;
    if (this.submitForm.valid) {
      
      this.subs.add(
        this.masterMerchantService
          .createMasterMerchant(this.masterMerchant)
          .subscribe(
            (masterMerchant) => {
              this.translate.get("createSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, masterMerchant.id);
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

  updateMasterMerchant() {
    this.masterMerchant.suspended = !this.isActive;
    if (this.submitForm.valid && this.masterMerchant.id) {
      
      Object.defineProperty(this.masterMerchant, 'balance', {
        value: this.currentBalance, 
        writable: false
      });
      //this.masterMerchant['balance'] = this.currentBalance;
      this.subs.add(
        this.masterMerchantService
          .updateMasterMerchant(this.masterMerchant.id, this.masterMerchant )
          .subscribe(
            () => {
              this.translate.get("updateSuccessMsg").subscribe(
                (res) => {
                  this.handleSuccessResponse(res, this.masterMerchant.id);
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

  handleSuccessResponse(msg: string, masterMerchantId: number) {
    
    this.router.navigate(["/admin/master-merchants", masterMerchantId, 'details']);
    this.toastr.success(msg);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
