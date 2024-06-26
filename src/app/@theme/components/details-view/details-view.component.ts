import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {getRelatedSystemId} from '@helpers/related-systemid';
import {TranslateService} from '@ngx-translate/core';
import {CurrentLangService} from '@shared/services/current-lang.service';
import {ErrorService} from '@shared/services/error.service';
import {CorporatePolicyService} from 'app/admin/corporate-policy/corporate-policy.service';
import {ProductCategoryService} from 'app/admin/product/productCategory.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.scss']
})
export class DetailsViewComponent implements OnInit {

  @Input() details: any
  openDropMenu: boolean = false
  categoryName: any
  id: number
  currentLang: string
  corporateId: number

  constructor(private currentLangService: CurrentLangService
    , private productCategoryService: ProductCategoryService, private route: ActivatedRoute, private translate: TranslateService, private corporatePolicyService: CorporatePolicyService, private toastr: ToastrService, private errorService: ErrorService) {
  }


  ngOnInit(): void {
    this.id = +this.route.snapshot.params['corporatePolicyId']
    this.route.parent.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");

    }),
      this.currentLang = this.currentLangService.getCurrentLang()
    this.translate.onLangChange.subscribe(({lang}) => {
      this.currentLang = lang;
    })

  }

  ngOnChanges() {
    if (this.details != undefined) {
      this.getCategroy(this.details.productCategoryId)
    }
  }


  getCategroy(Id: number) {
    this.productCategoryService.getProduct(Id).subscribe({
      next: (res) => {
        this.categoryName = res
      }
    })
  }

  SuspendedPolicy() {
    this.details.suspended = !this.details.suspended
    this.corporatePolicyService.updateCorporatePolicy(this.corporateId, this.id, this.details).subscribe(
      () => {
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
