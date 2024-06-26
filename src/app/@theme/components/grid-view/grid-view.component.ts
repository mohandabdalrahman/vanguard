import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {getRelatedSystemId} from '@helpers/related-systemid';
import {TranslateService} from '@ngx-translate/core';
import {CardHolderService} from '@shared/services/card-holder.service';
import {ErrorService} from '@shared/services/error.service';
import {CorporatePolicy} from 'app/admin/corporate-policy/corporate-policy.model';
import {CorporatePolicyService} from 'app/admin/corporate-policy/corporate-policy.service';
import {CorporateVehicleService} from 'app/admin/corporate-vehicle/corporate-vehicle.service';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss']
})
export class GridViewComponent implements OnInit {
  @Input() gridData: any;
  @Input() vehicleDetails
  @Input() userDetails
  @Input() currentLang: string
  @Input() type: string = ''
  @Input() Goto: string
  @Input() allCorporatePolicy: CorporatePolicy[];
  @Output() onUpdatePolicy = new EventEmitter();
  corporateId: number
  viewTransactionsLink: string = '';
  @Input() queryParamName: string

  constructor(private corporatePolicyService: CorporatePolicyService, private translate: TranslateService, private route: ActivatedRoute, private corporateVehicleService: CorporateVehicleService, private toastr: ToastrService, private errorService: ErrorService, private CardHolderService: CardHolderService, private authService: AuthService) {

  }


  ngOnInit(): void {
    this.translate.onLangChange.subscribe(({lang}) => {
      this.currentLang = lang;
    })
    this.route.parent.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");

    })
    this.viewTransactionsLink = this.authService.getUserType() === 'admin' ? `/admin/corporates/${this.corporateId}/details/transactions` : `/corporate/transactions`
  }

  OpenDropMenu(event: Event) {
    const target = event.target as HTMLButtonElement
    if (target.parentElement.nextElementSibling.classList.contains('d-none') == true) {
      target.parentElement.nextElementSibling.classList.add('d-block')
      target.parentElement.nextElementSibling.classList.remove('d-none')
    } else {
      target.parentElement.nextElementSibling.classList.remove('d-block')
      target.parentElement.nextElementSibling.classList.add('d-none')
    }

  }

  suspendedAssets(id: number) {

    if (this.vehicleDetails.length > 0) {

      const vehicleData = this.vehicleDetails.find((e) => {
        return e.id == id
      })
      vehicleData.suspended = !vehicleData.suspended
      this.corporateVehicleService.updateCorporateVehicle(this.corporateId, id, vehicleData).subscribe(
        () => {
          location.reload()
          this.translate.get("updateSuccessMsg").subscribe((msg) => {
            this.toastr.success(msg);
          });
        },

        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    } else {

      const CardHolderData = this.userDetails.find((e) => {
        return e.id == id
      })

      CardHolderData.suspended = !CardHolderData.suspended

      this.CardHolderService.updateCardHolderPolicy(this.corporateId, id, CardHolderData).subscribe(
        () => {
            // this.onUpdatePolicy.emit()
          location.reload()
          this.translate.get("updateSuccessMsg").subscribe((msg) => {
            this.toastr.success(msg);
          });
        },

        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    }
  }

  suspendedpolicy(corporateId: number, policyiId: number) {

    const Policy = this.allCorporatePolicy.find((e) => {
      return e.id == policyiId
    })
    Policy.suspended = !Policy.suspended

    this.corporatePolicyService.updateCorporatePolicy(corporateId, policyiId, Policy).subscribe(
      () => {
        this.onUpdatePolicy.emit()
        this.translate.get("updateSuccessMsg").subscribe((msg) => {
          this.toastr.success(msg);
        });
      },

      (err) => {
        this.errorService.handleErrorResponse(err);
      }
    )
  }

}




