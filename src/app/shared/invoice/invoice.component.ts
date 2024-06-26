import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {SubSink} from "subsink";
import {ColData} from "@models/column-data.model";
import {ToastrService} from "ngx-toastr";
import {ErrorService} from "@shared/services/error.service";
import {TranslateService} from "@ngx-translate/core";
import {Invoice, InvoiceProduct} from "@models/invoices.model";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {MerchantService} from "../../admin/merchants/merchant.service";
import {CountryService} from "../../admin/countries/country.service";
import {CityService} from "../../admin/cities/city.service";
import {ZoneService} from "../../admin/zones/zone.service";
import {Merchant} from "../../admin/merchants/merchant.model";
import {Country} from "../../admin/countries/country.model";
import {Zone} from "../../admin/zones/zone.model";
import {PdfService} from "@shared/services/pdf.service";
import { PdfProperties } from '@models/pdfContent.model';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})

export class InvoiceComponent implements OnInit, OnDestroy, OnChanges {
  @Input() invoice: Invoice;
  @Input() merchantAddressCity: string;
  @Input() invoiceProducts: InvoiceProduct[] | any;
  @Input() showInvoiceActions: boolean = true;
  @Input() showSettleBtn: boolean = false;
  @Output() onAddSerialNumber = new EventEmitter<any>();
  @Output() onSettleInvoice = new EventEmitter<any>();
  private subs = new SubSink();
  currentLang: string;
  gridData: any[] = [];
  colData: ColData[] = [];
  countryName: string;
  zoneName: string;
  cityName: string;
  cityId: number;
  zoneId: number;
  code: string = "EGP";
  merchantAddress: string;

  constructor(
    
    private toastr: ToastrService,
    private errorService: ErrorService,
    private translate: TranslateService,
    private merchantService: MerchantService,
    private currentLangService: CurrentLangService,
    private countryService: CountryService,
    private cityService: CityService,
    private zoneService: ZoneService,
    private pdfService: PdfService
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.setColData();
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
        this.setColData();
        this.setGridData(this.invoiceProducts);
      }),
    )

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setGridData(this.invoiceProducts);
    if (changes.invoice?.currentValue?.merchantId) {
      // this.getMerchant();
    }
  }

  setColData() {
    this.colData = [
      {field: "id", header: "invoice.product.id"},
      {field: "productName", header: "invoice.product.name"},
      // {field: "unitPrice", header: "invoice.product.price"},
      {field: "quantity", header: "invoice.product.quantity"},
      {field: "amount", header: "invoice.product.amount"},
      {field: "vat", header: "invoice.product.vat"},
      {field: "holdingTax", header: "invoice.product.holdingTax"},
      {field: "totalAmountIncludingVat", header: "invoice.product.total"},
    ];
  }

  setGridData(data: InvoiceProduct[]) {
    this.gridData = data.map((product, index) => {
      return {
        id: index + 1,
        productName: product.productName,
        //unitPrice: product.unitPrice,
        quantity: product.quantity,
        amount: product.amount,
        vat: product.vat,
        holdingTax: product.holdingTax,
        totalAmountIncludingVat: product.totalAmountIncludingVat
      };
    });
  }


  getMerchant() {
    
    this.subs.add(
      this.merchantService
        .getMerchant(this.invoice?.merchantId)
        .subscribe(
          (merchant: Merchant) => {
            if (merchant) {
              this.merchantAddress = merchant.billingAddress;
              // this.cityId = merchant.cityId;
              // this.zoneId = merchant.zoneId;
              // this.getCountry(merchant.countryId)
            } else {
              this.translate.get(["error.noMerchantsFound", "type.warning"]).subscribe(
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

  getCountry(countryId: number) {
    
    this.subs.add(
      this.countryService.getCountry(countryId).subscribe(
        (country: Country) => {
          if (country) {
            this.countryName = this.currentLang === 'en' ? country.enName : country.localeName;
            this.code = country.currency.code;
            this.getCity(countryId, this.cityId);
          }
          
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
        }
      )
    );
  }

  getCity(countryId: number, cityId: number) {
    if (countryId !== undefined && cityId !== undefined) {
      
      this.subs.add(
        this.cityService.getCity(countryId, cityId).subscribe(
          (city) => {
            if (city) {
              this.cityName = city.enName;
              this.getZone(countryId, cityId, this.zoneId);
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

  getZone(countryId: number, cityId: number, zoneId: number) {
    if (countryId !== undefined && cityId !== undefined && zoneId !== undefined) {
      
      this.subs.add(
        this.zoneService
          .getZone(countryId, cityId, zoneId)
          .subscribe(
            (zone: Zone) => {
              if (zone) {
                this.zoneName = zone.enName;
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

  print() {
    let pdfProperties: PdfProperties;
    pdfProperties = {
      pdfAboutInfo: {
        lang: this.currentLang,
        fileName:  this.currentLang == "en" ? `${this.invoice.corporateEnName} Invoice`:`فاتورة ${this.invoice.corporateLocaleName}`
      },
      pdfData: [{
        metaData:{
          merchantName: this.currentLang == "en"? this.invoice.merchantEnName: this.invoice.merchantLocaleName,
        },
        dataTable:{
          colData: this.colData,
          gridData: this.gridData
        },
        dataLabel:{
          pageHeaderData: [{header:"invoice.serialNumber", field:this.invoice.serialNumber}],
          noBorderDivData:[
              {header:'app.fromDate', field:this.invoice?.fromDate},
              {header:'app.toDate', field:this.invoice?.toDate},
            ],
          groupOneData:[
              {header:'invoice.site.name',field:this.currentLang === 'en' ? this.invoice?.siteEnName : this.invoice?.siteLocaleName},
              {header:'invoice.merchantTaxId',field:this.invoice?.merchantTaxId},
              {header:'invoice.merchant.cr',field:this.invoice?.merchantCommercialRegistrationNumber},
              {header:'invoice.merchant.address',field:'القاهره'},
            ],
          groupTwoData:[
              {header:'invoice.corporate.name',field:this.currentLang === 'en' ? this.invoice?.corporateEnName : this.invoice?.corporateLocaleName},
              {header:'invoice.corporateTaxId',field:this.invoice?.corporateTaxId},
              {header:'invoice.corporate.cr',field:this.invoice?.corporateCommercialRegistrationNumber},
            ],
          totalsData:[
              {header:'invoice.totalHoldingTaxAmount', field:`${this.invoice?.totalHoldingTaxAmount} EGP`},
              {header:'invoice.totalVatAmount', field:`${this.invoice?.totalVatAmount} EGP`},
              {header:'invoice.totalAmount', field:`${this.invoice?.totalAmount} EGP`},
            ]
        }
      }],
      pdfComponentsWidth:{
        titleSizeTwo: 50,
        tableLabelWidth: 50,
        tableValueWidth: 50,
      }

    }
    this.pdfService.printInvoicePdf(pdfProperties, true);

    // this.pdfService.printInvoice(this.colData,this.gridData,this.currentLang, this.invoice);
    // this.pdfService.exportAsPDF(document.getElementById('printable'), 'Invoice', false);
  }

  addSerialNumber(event) {
    this.onAddSerialNumber.emit(event);
  }

  settleInvoice(event) {
    this.onSettleInvoice.emit(event);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
