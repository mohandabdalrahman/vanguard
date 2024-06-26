import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ModalComponent } from "@theme/components/modal/modal.component";
import { SubSink } from "subsink";
import { Invoice, InvoiceProduct } from "@models/invoices.model";
import { ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { TranslateService } from "@ngx-translate/core";
import { MerchantInvoicesService } from "../../merchant-invoices/merchant-invoices.service";
import * as moment from "moment";
import { NgForm } from "@angular/forms";
import { AuthService } from "../../../auth/auth.service";
import { CorporateInvoicesService } from "../../corporate-invoices/corporate-invoices.service";

@Component({
  selector: "app-admin-invoice-details",
  templateUrl: "./admin-invoice-details.component.html",
  styleUrls: ["./admin-invoice-details.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AdminInvoiceDetailsComponent implements OnInit {
  @ViewChild("serialModal") private serialModalComponent: ModalComponent;
  @ViewChild("settleModal") private settleModalComponent: ModalComponent;
  @ViewChild("serialNumberForm") serialNumberForm: NgForm;

  private subs = new SubSink();
  invoiceId: number;
  userTypeId: number;
  invoiceProducts: InvoiceProduct[] = [];
  adminInvoice: Invoice;
  userType: string;

  constructor(
    private route: ActivatedRoute,
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private merchantInvoicesService: MerchantInvoicesService,
    private authService: AuthService,
    private corporateInvoiceService: CorporateInvoicesService
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.userTypeId = +params["userTypeId"];
        this.invoiceId = params["invoiceId"];
      })
    );
    if (this.userTypeId && this.invoiceId) {
      this.getAdminInvoiceDetails();
    }
  }

  getAdminInvoiceDetails() {
    
    const calledFunc =
      this.userType !== "master_corporate"
        ? this.merchantInvoicesService.getMerchantInvoice(
            this.userTypeId,
            this.invoiceId
          )
        : this.corporateInvoiceService.getCorporateInvoice(
            this.userTypeId,
            this.invoiceId
          );
    this.subs.add(
      calledFunc.subscribe(
        (adminInvoice: Invoice) => {
          if (adminInvoice) {
            this.adminInvoice = adminInvoice;
            this.adminInvoice.fromDate = moment(
              this.adminInvoice.fromDate,
              "DD-MM-YYYY"
            ).format("DD/MM/YY");
            this.adminInvoice.toDate = moment(
              this.adminInvoice.toDate,
              "DD-MM-YYYY"
            ).format("DD/MM/YY");
            this.adminInvoice.creationDate = "";
            this.invoiceProducts = adminInvoice.invoiceProducts;
          } else {
            this.translate
              .get(["error.noMerchantInvoiceFound", "type.warning"])
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

  openSerialModal() {
    this.serialNumberForm.reset();
    this.serialModalComponent.open();
  }

  submitSerialNumber(formValue) {
    if (formValue.serialNumber) {
      
      this.subs.add(
        this.merchantInvoicesService
          .setInvoiceSerialNumber(this.userTypeId, this.invoiceId, {
            ...this.adminInvoice,
            serialNumber: formValue.serialNumber,
          })
          .subscribe(
            () => {
              
              this.serialModalComponent.closeModal();
              this.getAdminInvoiceDetails();
            },
            (err) => {
              this.translate
                .get("invoice.serialNumberError")
                .subscribe((res: string) => {
                  this.errorService.handleErrorResponse(err, res);
                });
            }
          )
      );
    }
  }

  settleInvoice() {
    
    this.subs.add(
      this.merchantInvoicesService
        .settleInvoices(this.userTypeId, [this.invoiceId])
        .subscribe(
          () => {
            
            this.settleModalComponent.closeModal();
            this.getAdminInvoiceDetails();
            this.translate.get(["success.settled"]).subscribe((res) => {
              this.toastr.success(Object.values(res)[0] as string);
            });
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  openSettleModal() {
    this.settleModalComponent.open();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
