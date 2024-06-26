import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubSink} from "subsink";
import {CorporateInvoicesService} from "../corporate-invoices.service";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {ActivatedRoute} from "@angular/router";
import {Invoice, InvoiceProduct} from "@models/invoices.model";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'app/auth/auth.service';
import * as moment from "moment";

@Component({
  selector: "app-corporate-invoice-details",
  templateUrl: "./corporate-invoice-details.component.html",
  styleUrls: ["./corporate-invoice-details.component.scss"],
})
export class CorporateInvoiceDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  invoiceId: number;
  corporateId: number;
  invoiceProducts: InvoiceProduct[] = [];
  corporateInvoice: Invoice;
  userType: string;

  constructor(
    private route: ActivatedRoute,
    private corporateInvoicesService: CorporateInvoicesService,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
      this.route.params.subscribe((params) => {
        this.invoiceId = params["invoiceId"];
      })
    );
    if (this.corporateId && this.invoiceId) {
      this.getCorporateInvoiceDetails();
    }
  }

  getCorporateInvoiceDetails() {
    
    this.subs.add(
      this.corporateInvoicesService
        .getCorporateInvoice(this.corporateId, this.invoiceId)
        .subscribe(
          (corporateInvoice: Invoice) => {
            if (corporateInvoice) {
              this.corporateInvoice = corporateInvoice;
              this.corporateInvoice.creationDate = moment(
                corporateInvoice.creationDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.corporateInvoice.fromDate = moment(
                corporateInvoice.fromDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.corporateInvoice.toDate = moment(
                corporateInvoice.toDate,
                "DD-MM-YYYY"
              ).format("DD/MM/YY");
              this.invoiceProducts = corporateInvoice.invoiceProducts;
            } else {
              this.translate
                .get(["error.noCorporateBillFound", "type.warning"])
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
