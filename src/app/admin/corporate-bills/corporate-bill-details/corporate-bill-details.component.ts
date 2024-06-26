import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";

import { ToastrService } from "ngx-toastr";
import { ErrorService } from "@shared/services/error.service";
import { ActivatedRoute } from "@angular/router";
import { CorporateBillsService } from "../corporate-bills.service";
import { SubSink } from "subsink";
import { CorporateBill } from "../corporate-bills.model";
import { CorporateService } from "../../corporates/corporate.service";
import { Corporate } from "../../corporates/corporate.model";
import { TranslateService } from "@ngx-translate/core";
import { ColData } from "@models/column-data.model";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { Country } from "../../countries/country.model";
import { CountryService } from "../../countries/country.service";
import { AuthService } from "../../../auth/auth.service";
import { PdfService } from "@shared/services/pdf.service";
import { PdfProperties } from "@models/pdfContent.model";

@Component({
  selector: "app-corporate-bill-details",
  templateUrl: "./corporate-bill-details.component.html",
  styleUrls: [
    "../../../shared/invoice/invoice.component.scss",
    "./corporate-bill-details.component.scss",
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CorporateBillDetailsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  billId: number;
  corporateId: number;
  corporateBill: CorporateBill;
  corporate: Corporate;
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  code: string;
  userType: string;
  userTypeId: number;
  isTabsView: boolean;
  billGrossAmount: number;
  billNetAmount: number;
  billHeaderSection: ColData[] = [];
  sellerData: ColData[]=[];
  buyerData: ColData[]=[];
  totalAmountsData: ColData [] = [];

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private corporateBillsService: CorporateBillsService,
    private corporateService: CorporateService,
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private countryService: CountryService,
    private authService: AuthService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.currentLang = this.currentLangService.getCurrentLang();
    this.isTabsView = !!this.route.snapshot.data["view"];
    this.setColData();
    this.subs.add(
      // this.route.parent.params.subscribe((params) => {
      //   this.corporateId = +getRelatedSystemId(params, "corporateId");
      //   this.getCorporate();
      // }),
      this.route.params.subscribe((params) => {
        this.corporateId = +params["userTypeId"];
        this.billId = params["billId"];
        this.getCorporate();
      }),
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.corporateBill);
      })
    );

    if (this.corporateId && this.billId) {
      this.getCorporateBillDetails();
    }
  }

  setColData() {
    this.colData = [
      { field: "id", header: "app.id" },
      { field: "commissionRate", header: "bill.commissionRate" },
      { field: "commissionAmount", header: "bill.commissionAmount" },
      { field: "vatAmount", header: "bill.vatAmount" },
      { field: "totalSalesAmount", header: "bill.totalSalesAmount" },
    ];
  }

  setGridData(data: CorporateBill) {
    this.gridData = [
      {
        id: data?.id,
        commissionRate: data?.commissionRate + ' %',
        commissionAmount: (data?.commissionAmount).toFixed(2),
        vatAmount: (data?.vatAmount).toFixed(2),
        totalSalesAmount: (data?.totalSalesAmount).toFixed(2),
      },
    ];
  }

  getCorporateBillDetails() {
    
    this.subs.add(
      this.corporateBillsService
        .getCorporateBill(this.corporateId, this.billId)
        .subscribe(
          (corporateBill: CorporateBill) => {
            if (corporateBill) {
              this.corporateBill = corporateBill;

              this.corporateBill.toDate = corporateBill?.toDate.split(" ")[0];
              this.billNetAmount = corporateBill?.commissionAmount  - corporateBill?.vatAmount ;
              this.billGrossAmount = corporateBill?.commissionAmount ;
              this.setGridData(corporateBill);
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

  getCorporate(): void {
    
    this.subs.add(
      this.corporateService.getCorporate(this.corporateId).subscribe(
        (corporate) => {
          if (corporate) {
            this.corporate = corporate;
            this.getCountry(corporate.countryId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCountry(countryId: number) {
    
    this.subs.add(
      this.countryService.getCountry(countryId).subscribe(
        (country: Country) => {
          if (country) {
            this.code = country.currency.code;
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  print() {
    let pdfProperties: PdfProperties;
    pdfProperties = {
      pdfAboutInfo: {
        lang: this.currentLang,
        fileName: "bill.corporateBill"
      },
      pdfData: [{
        dataTable:{
          colData: this.colData,
          gridData: this.gridData
        },
        dataLabel:{
          noBorderDivData:[
            {header:'invoice.seller.taxId',field:'628955804'},
            {header:'invoice.seller.cr', field:'15620'},
          ],
          groupOneData:[
            {header:'app.date',field:this.corporateBill?.toDate},
            {header:'invoice.merchant.address',field:`${this.currentLang == 'ar'?"13 أ ش يافع بن زيد متفرع من ش مراد الجيزة - مصر":" 13A, Yafe Bin Zaid st, Branched from Morad st, Giza, Giza government"}`},
            {header:'invoice.merchant.phonenumber',field:'+20 120 1111 040'},
          ],
          groupTwoData:[
            {header:'invoice.buyer.name',field:this.currentLang == 'en'? this.corporate?.enName : this.corporate?.localeName},
            {header:'invoice.buyer.taxId', field:this.corporate?.taxId},
            {header:'invoice.buyer.cr',field:this.corporate?.commercialRegistrationNumber},
          ],
          totalsData:[
            {header:'invoice.totalNetAmount', field:this.billNetAmount?.toFixed(2)+this.code},
            {header:'invoice.totalAmount',field:this.billGrossAmount?.toFixed(2)+this.code},
          ]
        }
      }],
      pdfComponentsWidth:{
        titleSizeTwo: 50,
        tableLabelWidth: 50,
        tableValueWidth: 50,
      }

    }

    this.pdfService.printInvoicePdf(pdfProperties, false);

    // this.pdfService.printBill({titleSizeTwo:20, tableLabelWidth:25, tableValueWidth:20 }, this.colData,this.gridData,"bill.corporateBill",this.currentLang, this.billHeaderSection ,this.sellerData, this.buyerData,this.totalAmountsData)
    //   this.pdfService.exportInvoiceAsPDF(
    //   document.getElementById("printable"),
    //   "CorporateBill"
    // );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
