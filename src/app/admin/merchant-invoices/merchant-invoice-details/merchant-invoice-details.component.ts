import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SubSink} from "subsink";
import {MerchantInvoicesService} from "../merchant-invoices.service";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {Invoice, InvoiceProduct} from "@models/invoices.model";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {AuthService} from "../../../auth/auth.service";
import * as moment from "moment";
import {CorporateService} from 'app/admin/corporates/corporate.service';

@Component({
  selector: 'app-merchant-invoice-details',
  templateUrl: './merchant-invoice-details.component.html',
  styleUrls: ['./merchant-invoice-details.component.scss'],
})
export class MerchantInvoiceDetailsComponent implements OnInit, OnDestroy {
  @ViewChild("modal") private modalComponent: ModalComponent;
  private subs = new SubSink();
  invoiceId: number;
  merchantId: number;
  invoiceProducts: InvoiceProduct[] = [];
  merchantInvoice: Invoice;
  userType: string;
  hasMasterCorporate: boolean = false;
  corporateInvoiceEnName: string;
  corporateInvoiceLocaleName: string;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private merchantInvoicesService: MerchantInvoicesService,
    private authService: AuthService,
    private corporateService: CorporateService
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.merchantId = +getRelatedSystemId(params, "merchantId");
      }),
      this.route.params.subscribe((params) => {
        this.invoiceId = params["invoiceId"];
      })
    )
    if (this.merchantId && this.invoiceId) {
      this.getMerchantInvoiceDetails();
    }
  }

  getCorporateDetails(corporateId: number) {
    
    this.subs.add(
      this.corporateService.getCorporate(corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.merchantInvoice.corporateEnName = corporate.enName;
            this.merchantInvoice.corporateLocaleName = corporate.localeName;
            // this.hasMasterCorporate = !!corporate.masterCorporateId;
            // if(this.hasMasterCorporate){
            //   this.getMasterCorporate(corporate.masterCorporateId);
            // }

          } else {
            this.translate
              .get(["error.noCorporateFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }
  getMasterCorporate(masterCorporateId: number) {
    
    this.subs.add(
      this.corporateService.getMasterCorporate(masterCorporateId).subscribe(
        (mcorporate) => {
          if (mcorporate && this.merchantInvoice) {
            this.merchantInvoice.corporateEnName = mcorporate.enName;
            this.merchantInvoice.corporateLocaleName= mcorporate.localeName;
          } else {
            this.translate
              .get(["error.noCorporateFound", "type.warning"])
              .subscribe((res) => {
                this.toastr.warning(
                  Object.values(res)[0] as string,
                  Object.values(res)[1] as string
                );
              });
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getMerchantInvoiceDetails() {
    
    this.subs.add(
      this.merchantInvoicesService
        .getMerchantInvoice(this.merchantId, this.invoiceId)
        .subscribe(
          (merchantInvoice: Invoice) => {
            if (merchantInvoice) {
              this.merchantInvoice = merchantInvoice;
              this.getCorporateDetails(merchantInvoice.corporateId);
              this.merchantInvoice.fromDate = moment(
                merchantInvoice.fromDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.merchantInvoice.toDate = moment(
                merchantInvoice.toDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.merchantInvoice.creationDate = moment(
                merchantInvoice.creationDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.invoiceProducts = merchantInvoice.invoiceProducts;
            } else {
              this.translate.get(["error.noMerchantInvoiceFound", "type.warning"]).subscribe(
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


  addSerialNumber() {
    this.modalComponent.open()
  }

  submitSerialNumber(formValue) {
    if (formValue.serialNumber) {
      
      this.subs.add(
        this.merchantInvoicesService.setInvoiceSerialNumber(this.merchantId, this.invoiceId, {
          ...this.merchantInvoice,
          serialNumber: formValue.serialNumber
        }).subscribe(
          () => {
            
            this.modalComponent.closeModal();
            this.getMerchantInvoiceDetails();
          },
          (err) => {
            this.translate.get('invoice.serialNumberError').subscribe((res: string) => {
              this.errorService.handleErrorResponse(err, res);
            });
          }
        )
      );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
