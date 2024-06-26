import { Injectable } from '@angular/core';
import { ColData } from '@models/column-data.model';
import { PdfComponentsWidth, PdfContent, PdfData, PdfProperties, PdfTableStructure } from '@models/pdfContent.model';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  currentLang: string;
  invoicesLength: number;
  isInvoicePdf: boolean;

  // style objects
  commonStyle = {
    alignment: "center",
  };
  tableHeaderStyle = {
    color: '#ffffff',
    fillColor: '##1139d3',
    fontSize: 8,
    bold: true,
    margin: [0, 5, 0, 5],
    ...this.commonStyle
  };
  tableCellStyle = {
    fontSize:7,
  };
  tableLabelStyle = {
    color: '#8589a0',
    fontSize: 10,
    bold: true,

  };
  tableDataValueStyle = {
    color: '#000000',
    fontSize: 7,
  };
  titleStyle = {
    fontSize: 16,
    alignment: "center",
    margin: [5, 5, 5, 20],
    ...this.commonStyle
  };
  ltrStyle = {
    alignment: "left",
  };
  rtlStyle = {
    alignment: "right",
  };
  zebraTableLayout = {
    fillColor: function (rowIndex) {
      return (rowIndex % 2 === 0) ? '#edf1f7' : '#fff';
    },
    hLineWidth: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? 1 : 1;
    },
    vLineWidth: function (i, node) {
      return (i === 0 || i === node.table.widths.length) ? 1 : 0;
    },
    hLineColor: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
    },
    vLineColor: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
    },
  };
  primaryTableLayout = {
    hLineWidth: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? 1 : 1;
    },
    vLineWidth: function (i, node) {
      return (i === 0 || i === node.table.widths.length) ? 1 : 0;
    },
    hLineColor: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
    },
    vLineColor: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
    },
  };
  greyDiv = {
    vLineWidth: function (i, node) {
      return (i === 0 || i === node.table.widths.length) ? 1 : 0;
    },
    hLineColor: function (i, node) {
      return (i === 0 || i === node.table.body.length) ? 'grey' : 'grey';
    },
    vLineColor: function (i, node) {
      return (i === 0 || i === node.table.widths.length) ? 'grey' : 'grey';
    },
    paddingLeft: () => 10 ,
    paddingRight: () =>  10 ,
    paddingTop: () =>  10 ,
    paddingBottom: () =>  10
  };


  constructor(
    private translate: TranslateService
  ) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  pdfFontBasedLang(): string {
    pdfMake.fonts = {
      Almarai: {
        normal: "https://manex-dev-dba347c716d5c8eac110da2e8add74c0.s3.me-south-1.amazonaws.com/Almarai-Regular.ttf",
        bold: "https://manex-dev-dba347c716d5c8eac110da2e8add74c0.s3.me-south-1.amazonaws.com/Almarai-Bold.ttf",
      },
      Geomanist: {
        normal: "https://manex-dev-dba347c716d5c8eac110da2e8add74c0.s3.me-south-1.amazonaws.com/Geomanist-Regular.otf",
        bold: "https://manex-dev-dba347c716d5c8eac110da2e8add74c0.s3.me-south-1.amazonaws.com/Geomanist-Bold.ttf",
      },
    }
    return 'Almarai';
  }

  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  translateFileName(fileName: string): string {
    let fileNameTranslated: string;
    this.translate.get(fileName).subscribe(
      (res) => {
        fileNameTranslated = res;
      })
    return fileNameTranslated;
  }

  translateColData(colData: ColData[]): ColData[] {
    let headerKeys: string[] = [];
    let translatedColData: ColData[] = [];

    headerKeys = colData?.map(colDataElement => colDataElement.header);
    this.translate.get(headerKeys).subscribe(
      (translatedHeaders) => {
        colData.forEach(
          (colDataElement) => {
            for (let keyOfHeader in translatedHeaders) {
              if (keyOfHeader) {
                if (colDataElement.header == keyOfHeader) {
                  translatedColData.push({
                    field: colDataElement.field,
                    header: translatedHeaders[keyOfHeader]
                  });
                }
              }
            }
          }
        )
      }
    )
    return translatedColData;
  }

  rtlText(text: string, textWidth?: number): string {
    let arabicCharacters = /[ء-ي]+/;
    let returnedText;

    if (arabicCharacters.test(text)) {



      let arrayOfText = text.split(" ");
      let width = textWidth
      let remainingChar = width
      let line: string[] = ["\n"];
      // let newLine : string[] = [];

      var counter = 0;
      var bracketFormat = /\(.*?\)/g;
      const textLength = arrayOfText.join('').length

      if (textLength <= width) {
        line = this.reverseBefNewLine(arrayOfText);
      } else {
        arrayOfText.map((word) => {
          if (word.length > remainingChar) {

            var lastIndex = line.lastIndexOf("\n")
            var oldLine = line.slice(0, lastIndex+1)
            var toBeReversed = line.slice(lastIndex, line.length)
            oldLine.push(...this.reverseBefNewLine(toBeReversed));
            line = oldLine
            line.push("\n")

            remainingChar = width;
          }
          if (bracketFormat.test(word)){
            let reveBracketWord = word.replace("(",")");
            let strResult ;
            strResult = reveBracketWord.split('');
            strResult.splice(reveBracketWord.lastIndexOf(')'),1,'(');
            strResult = strResult.join('');
            word = strResult
          }
          line.push(word)
          remainingChar = remainingChar - (word.length + 1)
          counter++

          if (counter == arrayOfText.length) {
            var lastIndex = line.lastIndexOf("\n")
            var oldLine = line.slice(0, lastIndex+1)
            var toBeReversed = line.slice(lastIndex, line.length)
            oldLine.push(...this.reverseBefNewLine(toBeReversed));
            line = oldLine
            line.push("\n")
          }
        })
        line.shift()
      }

    let textDis = line.join(" ");
      returnedText = textDis
    } else {
      returnedText = text;
    }

    return returnedText;
  }

  reverseBefNewLine(text: string[]): string[] {
    return text.slice(text.lastIndexOf("\n") + 1, text.length).reverse();
  }

  pageTextAlignStyle() {
    if (this.currentLang == 'ar') {
      Object.assign(this.tableLabelStyle, this.rtlStyle)
      Object.assign(this.tableDataValueStyle, this.rtlStyle)
    } else if (this.currentLang = 'en') {
      Object.assign(this.tableLabelStyle, this.ltrStyle)
      Object.assign(this.tableDataValueStyle, this.ltrStyle)
    }
  }

  useManexPageHeader(): {}[]{
    return [
      {
        margin:[20,20,10,20],
        table: {
          dontBreakRows: true,
          widths:'33%',
          body: [
            [
              {
                image: 'manexEnLogo',
                fit: [70, 70],
                alignment:'left'
              },
              ' ',
              {
                image: 'manexArLogo',
                fit: [70, 70],
                alignment:'right'
              },
            ],
          ]
        },
        layout: 'noBorders'
      },
    ]
  }

  useSolarusPageHeader(): {}[]{
    return [
      {
        margin: [20, 10, 0, 10],
        image: 'solarusLogo',
        fit: [100, 100],
        alignment: 'left',
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 5, x2: 550, y2: 5, lineWidth: 0.5, lineColor: '#E3E5E5' },
        ],
      }
    ]
  }

  drawInvoiceHeader(dataGroupOne: ColData[], metaData: string, componentsWidth: PdfComponentsWidth){
    let groupOneTable: PdfTableStructure, divDetails, greyDivData, component;
    groupOneTable = this.drawLabelDataTable(dataGroupOne, componentsWidth.tableLabelWidth, componentsWidth.tableValueWidth);
    divDetails = [
      {
        widths:"*",
        margin: [this.invoicesLength<=1?this.currentLang=="ar"?185:0:this.currentLang=="ar"?220:0, 0, 0, 0],
        table: {
          widths: groupOneTable.columnWidths,
          heights: 30,
          dontBreakRows: true,
          body: groupOneTable.body
        },
        layout: 'noBorders'
      },
      {
        widths:"*",
        margin: [0, 0, this.currentLang=="ar"?150:0, 0],
        text: metaData,
        layout: 'noBorders'
      }
    ]
    greyDivData = this.reverseGreyDiv(divDetails);

    component = {
      margin: [0, 0, 0, 0],
      table: {
        dontBreakRows: true,
        widths:this.currentLang == "ar"?[200,410]:[315,200],
        body: [greyDivData]
      },
      layout: 'noBorders'
    }

    return component;
  }

  drawPageHeader(pageHeader){
    return [
            {
              margin: [20, 20, 0, 0],
              table: {
                dontBreakRows: true,
                alignment:`${ this.currentLang == "en"? "left":"right"}`,
                widths:["*","10%","*"],
                body: [  this.currentLang == "ar"?  pageHeader : [...pageHeader].reverse()]
              },
              layout: 'noBorders',
            },
            {
              canvas: [
                { type: 'line', x1: 0, y1: 5, x2: 550, y2: 5, lineWidth: 0.5, lineColor: '#E3E5E5' },
              ],
            }
    ]
  }

  drawNoBorderDiv( colData: ColData[], componentsWidth: PdfComponentsWidth){
    let divData: PdfTableStructure, component;

    divData = this.drawLabelDataTable(colData, componentsWidth.tableLabelWidth, componentsWidth.tableValueWidth);
    component = [
      {
        width: '*',
        table: {
          dontBreakRows: true,
          widths: divData.columnWidths,
          heights: 20,
          body: divData.body
        },
        layout: 'noBorders'
      },
    ]
    if(this.isInvoicePdf){
      this.currentLang == 'ar' ? component.unshift({ width: '*', text:'' },{ width: '*', text:'' },{ width: '*', text:'' },{ width: '*', text:'' },{ width: '*', text:'' }) : component;
    } else {
      this.currentLang == 'ar' ? component.unshift({ width: '*', text:'' },{ width: '*', text:'' }) : component;
    }
    return component;
  }

  drawGreyDiv(dataGroupOne: ColData[], dataGroupTwo: ColData [], componentsWidth: PdfComponentsWidth){
    let groupOneTable: PdfTableStructure, divDetails,groupTwoTable: PdfTableStructure, greyDivData, component;
    if(dataGroupOne){
      groupOneTable = this.drawLabelDataTable(dataGroupOne, componentsWidth.tableLabelWidth, componentsWidth.tableValueWidth);
    }
    if(dataGroupTwo){
      groupTwoTable = this.drawLabelDataTable(dataGroupTwo, componentsWidth.tableLabelWidth, componentsWidth.tableValueWidth);
    }

    divDetails = [
      ...[ dataGroupOne && {
        widths:"*",
        margin: [this.isInvoicePdf?this.currentLang=="ar"?45:0:this.currentLang=="ar"?10:0, 0, 0, 0],
        table: {
          widths: groupOneTable?.columnWidths,
          heights: 30,
          dontBreakRows: true,
          body: groupOneTable?.body
        },
        layout: 'noBorders'
      }],
      ... [dataGroupTwo && {
        widths:"*",
        margin: [0, 0, 0, 0],
        table: {
          widths: groupTwoTable?.columnWidths,
          heights: 30,
          alignment: "right",
          dontBreakRows: true,
          body: groupTwoTable?.body
        },
        layout: 'noBorders'
      }]
    ].filter(Boolean)

    greyDivData = this.reverseGreyDiv(divDetails);

    component = {
      margin: [0, 15, 0, 15],
      table: {
        dontBreakRows: true,
        widths:this.isInvoicePdf?this.currentLang == "ar"?[260,250]:[315,200]:this.currentLang == "ar"?[200,310]:[315,200],
        body: [greyDivData]
      },
      layout: this.greyDiv
    }

    return component;
  }

  reverseGreyDiv(divDetails: {}[]): {}[]{
    return this.currentLang == 'ar' ? [...divDetails].reverse() : divDetails;
  }

  drawTotalsComponent(tableData: ColData[],labelDataWidth: PdfComponentsWidth, lastPage: boolean){
    let totalsDiv, totalsTable: PdfTableStructure;


    totalsTable = this.drawLabelDataTable(tableData,labelDataWidth.tableLabelWidth,labelDataWidth.tableValueWidth,true);
    totalsDiv = {
      margin: [0, 15, 0, 15],
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: totalsTable.columnWidths,
            heights: 20,
            body: totalsTable.body,
          },
          layout: this.primaryTableLayout
        },
        { width: '*', text: '', ...(!lastPage && {pageBreak: 'after'}) },
      ],
    } ;

    return totalsDiv;
  }

  drawTable(colData: ColData[], gridData: any, tableHeaderStyle?: string, tableHeaderTextWidth?: number ): PdfTableStructure {

    let translatedHeader: ColData[] = [];
    let tableHeader: {}[] = [];
    let tableData = [];
    let columnWidths: string[];


    translatedHeader = this.translateColData(colData);
    columnWidths = this.setColumnWidth(translatedHeader.length, false);

    tableHeader = translatedHeader.map((colDataElement: ColData) => {
      return { text: this.rtlText(colDataElement.header, tableHeaderTextWidth), style: tableHeaderStyle }
    });
    tableData.push(this.currentLang == "ar" ? tableHeader.reverse() : tableHeader);

    gridData.forEach((gridElement: any) => {
      let tableRow = [];
      translatedHeader.forEach((colDataElement: ColData) => {
        if (gridElement[colDataElement.field] == undefined) {
          tableRow.push('');
        } else {
          tableRow.push({ text: this.rtlText(gridElement[colDataElement.field], tableHeaderTextWidth), style: this.tableCellStyle });
        }
      });
      tableData.push(this.currentLang == "ar" ? tableRow.reverse() : tableRow);
    });
    return { body: tableData, columnWidths: columnWidths };
  }

  setColumnWidth(numberOfColumns: number, labeldata: boolean): string[] {
    let widths: string[] = [];
    let widthPerColumn = 100 / numberOfColumns;

    for (let i = 0; i < numberOfColumns; i++)
      labeldata ? widths.push('auto') : widths.push(`${widthPerColumn}%`)

    return widths;
  }

  drawReportComponent(reportPDF: boolean, colData: ColData[], gridData, tableHeaderStyle: string, tableHeaderTextWidth?: number): []{

    let component , table,tableData: PdfTableStructure;
    tableData = this.drawTable(colData, gridData, tableHeaderStyle, tableHeaderTextWidth);
    table= {
      widths: tableData.columnWidths,
      heights: 20,
      alignment: "justify",
      dontBreakRows: true,
      body: tableData.body
    }

    if(reportPDF){
      component.push({ width: '*', text: '' });
      component[1].table = table;
      component[1].layout = this.zebraTableLayout;
      component[1].width='90%';
      component.push({ width: '*', text: '' });
    } else {
      component = [
        {
          width: '100%',
          table: table,
          layout: this.zebraTableLayout
        },
      ];
    }

    return component;
  }

  drawLabelDataTable(tableData: ColData[], labelWidth: number, valueWidth: number, totalsTable?: boolean): PdfTableStructure {

    let tableBody: {}[] = [];
    let columnWidths: string[] = [];
    let translatedtableData: ColData[]  = [];
    let totalsTableFlag: boolean = false || totalsTable;


    translatedtableData = this.translateColData(tableData);

    tableBody = translatedtableData.map((colDataElement: ColData) => {
      let tableRow = [
        { text: this.rtlText(colDataElement.header, labelWidth), style: totalsTableFlag ? 'valuesStyle' : 'labelStyle' },
        { text: this.rtlText(colDataElement.field, valueWidth), style: 'valuesStyle' }
      ]
      return this.currentLang == "ar" ? tableRow.reverse() : tableRow;
    });

    columnWidths = this.setColumnWidth(2, true);

    return { body: tableBody, columnWidths: columnWidths };
  }

  drawPdfContent(pdfData: PdfData, pdfComponentsWidth: PdfComponentsWidth, lastPage:boolean){

    let header, noBorderDiv;
    let invoiceGreyDiv;
    let transactionComponent;
    let totalsComponent;
    let noBorderLabelWidth: number, noBorderValueChar: number;
    let greyDivLabel: number, greyDivValue: number;
    let totalsLabel: number, totalsValue: number;
    let fullPage = {
      pageContent:[]
    };

    if(this.isInvoicePdf){
      noBorderLabelWidth = pdfComponentsWidth.tableLabelWidth ;
      greyDivLabel = pdfComponentsWidth.tableLabelWidth ;
      totalsLabel = pdfComponentsWidth.titleSizeTwo ;
      totalsValue = pdfComponentsWidth.titleSizeTwo ;

    } else {
      noBorderLabelWidth = pdfComponentsWidth.titleSizeTwo  ;
      greyDivLabel = pdfComponentsWidth.tableLabelWidth ;
      totalsLabel = pdfComponentsWidth.tableLabelWidth ;
      totalsValue = pdfComponentsWidth.tableValueWidth;
    }
    noBorderValueChar = pdfComponentsWidth.tableValueWidth;
    greyDivValue = pdfComponentsWidth.tableValueWidth;

    if(this.isInvoicePdf){
      header = this.drawInvoiceHeader(pdfData.dataLabel.pageHeaderData,pdfData.metaData.merchantName,pdfComponentsWidth)
    }
    noBorderDiv = this.drawNoBorderDiv(pdfData.dataLabel.noBorderDivData,{tableLabelWidth: noBorderLabelWidth, tableValueWidth: noBorderValueChar});
    invoiceGreyDiv = this.drawGreyDiv(pdfData.dataLabel.groupOneData, pdfData.dataLabel.groupTwoData, {tableLabelWidth:greyDivLabel, tableValueWidth:greyDivValue});
    totalsComponent = this.drawTotalsComponent(pdfData.dataLabel.totalsData,{tableLabelWidth:totalsLabel,tableValueWidth:totalsValue},lastPage);
    transactionComponent = this.drawReportComponent(false, pdfData.dataTable.colData, pdfData.dataTable.gridData, 'header');

    fullPage = {
      pageContent : [
        this.isInvoicePdf ?header: null ,
        {
          margin: [0, 15, 0, 15],
          columns:  noBorderDiv ,
        },
        // BuyerSellerData
        invoiceGreyDiv,
        // Transaction Component
        {
          margin: [0, 15, 0, 15],
          columns: transactionComponent,
        },
        // Totals component
        totalsComponent,
      ]
    }

    return fullPage;
  }

  async printInvoicePdf (pdfProperties: PdfProperties, isInvoicePdf: boolean){
    let pdfContent: PdfContent ;
    let usedFont: string ;
    let fileNameTranslated: string ;
    let arrayfullPage = [];
    let lastPage: boolean;

    this.currentLang = pdfProperties.pdfAboutInfo.lang;
    this.invoicesLength = pdfProperties.pdfData.length;
    this.isInvoicePdf=isInvoicePdf;
    this.pageTextAlignStyle();
    usedFont = this.pdfFontBasedLang();
    fileNameTranslated = this.isInvoicePdf? pdfProperties.pdfAboutInfo.fileName : this.translateFileName(pdfProperties.pdfAboutInfo.fileName);
    pdfProperties.pdfData.forEach((page,index)=>{
      lastPage = (index == pdfProperties.pdfData.length-1)?true:false;
      arrayfullPage.push(this.drawPdfContent(page, pdfProperties.pdfComponentsWidth, lastPage) ) ;
    })

    pdfContent = {
      pageMargins: [20, this.isInvoicePdf?20:60, 20, 60],
      pageOrientation: 'Portrait',
      styles: {
        header: this.tableHeaderStyle,
        labelStyle: this.tableLabelStyle,
        valuesStyle: this.tableDataValueStyle
      },
      defaultStyle: {
        font: usedFont,
        alignment: 'center'
      },
      images: {
        solarusLogo: await this.getBase64ImageFromURL("../../assets/old-logo.svg"),
      },
      ...(!this.isInvoicePdf&&{header: () => {
          return this.useSolarusPageHeader()
      }}),
      ...(this.invoicesLength>1 &&{footer: function (currentPage, pageCount) {
        return { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'right', style: 'normalText', margin: [0, 20, 50, 0] }
      }}),
      content: arrayfullPage.map((fullPage)=>{
        return fullPage.pageContent
      }),
    };

    pdfMake.createPdf(pdfContent).download(fileNameTranslated);
  }

  async printReport(colData: ColData[], gridData: any, fileName: string, lang: string, reportTotalsData?: PdfProperties) {

    let pdfContent: PdfContent;
    let usedFont: string;
    let fileNameTranslated: string;
    let transactionComponent;
    let totalGreyDiv ;

    this.currentLang = lang;
    usedFont = this.pdfFontBasedLang();
    fileNameTranslated = this.translateFileName(fileName);
    transactionComponent = this.drawReportComponent(false, colData, gridData, 'header',10);
    if(reportTotalsData){
      totalGreyDiv = this.drawGreyDiv(
        reportTotalsData.pdfData[0].dataLabel.groupOneData,
        reportTotalsData.pdfData[0].dataLabel.groupTwoData, 
        {tableLabelWidth:50, tableValueWidth:50});
    }

    
    pdfContent = {
      pageMargins: [25, 60, 25, 50],
      pageOrientation: 'landscape',
      styles: {
        header: this.tableHeaderStyle,
        title: this.titleStyle,
        cellStyle: this.tableCellStyle,
        labelStyle: this.tableLabelStyle,
        valuesStyle: this.tableDataValueStyle
      },
      defaultStyle: {
        font: usedFont,
        alignment: 'center'
      },
      images: {
        manexArLogo: await this.getBase64ImageFromURL("../../assets/logo-ar.png"),
        manexEnLogo: await this.getBase64ImageFromURL("../../assets/logo-en.png"),
      },
      header: () => {
        return this.useManexPageHeader()
      },
      footer: function (currentPage, pageCount) {
        return { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'right', style: 'normalText', margin: [0, 20, 50, 0] }
       },
      content: [
        { text: this.rtlText(fileNameTranslated, 50), style: 'title' },
        {
          columns: transactionComponent ,
        },
        reportTotalsData? totalGreyDiv: null,
      ],
    };

    pdfMake.createPdf(pdfContent).download(fileNameTranslated);
  }

  // usePDFMake(itemsColData: any, colData: any, gridData: any, qrData: string, totalSales: any, totalSalesValue: any) {
  //   // console.log(qrData);
  //
  //   //   pdfMake.fonts = {
  //   //     MyFontName: {
  //   //         normal: 'DroidKufi-Regular.ttf',
  //   //         bold: 'DroidKufi-Regular.ttf',
  //   //         italics: 'DroidKufi-Regular.ttf',
  //   //         bolditalics: 'DroidKufi-Regular.ttf'
  //   //     }
  //   // }
  //
  //   let dd;
  //   // let expandedRow = 'transactionItemReportDtoList' in gridData[0]
  //   // let tableHeader : {}[] = [];
  //   // let tableSubHeader : {}[] = []
  //   // let headerStyle = {
  //   //   color: '#413a90',
  //   //   borderradius: '2px',
  //   //   fillColor: '#edf1f7',
  //   //   fontSize: 14,
  //   //   bold: true,
  //   //   margin: [5, 5, 5, 5]
  //   // }
  //
  //   // colData.forEach(element => {
  //   //   tableHeader.push({text: element, style:'test'})
  //   // });
  //   // itemsColData.forEach(element => {
  //   //   tableSubHeader.push({text: element, style:'test'})
  //   // });
  //
  //   // TotalSales
  //   dd = {
  //     pageSize: 'A4',
  //     pageOrientation: 'landscape',
  //     style: {
  //       fillColor: '#fff',
  //       fontSize: 14,
  //       bold: true,
  //     },
  //     content: [
  //       {
  //
  //         // layout: 'headerLineOnly',
  //         layout: {
  //
  //           fillColor: function (rowIndex, node, columnIndex) {
  //             return (rowIndex % 2 === 0) ? '#fff' : null;
  //           },
  //           hLineWidth: function (i, node) {
  //             return (i === 0) ? 1 : 0;
  //           },
  //           vLineWidth: function (i, node) {
  //             return (i === 0 || i === node.table.widths.length) ? 1 : 0;
  //           },
  //           hLineColor: function (i, node) {
  //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //           },
  //           vLineColor: function (i, node) {
  //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //           },
  //         },
  //         table: {
  //           widths: ['*', '*', '*', '*'],
  //           dontBreakRows: true,
  //           headerRows: 1,
  //           body: [
  //             [{ text: "Totals", colSpan: 4, margin: [10, 10, 10, 10] }, {}, {}, {}],
  //             [{ text: totalSales[0], margin: [10, 10, 10, 10] }, { text: totalSalesValue[0], margin: [10, 10, 10, 10] }, { text: totalSales[1], margin: [10, 10, 10, 10] }, { text: totalSalesValue[2], margin: [10, 10, 10, 10] }],
  //             [{ text: totalSales[2], margin: [10, 10, 10, 10] }, { text: totalSalesValue[1], margin: [10, 10, 10, 10] }, { text: totalSales[3], margin: [10, 10, 10, 10] }, { text: totalSalesValue[3], margin: [10, 10, 10, 10] }],
  //           ]
  //         }
  //       }
  //     ]
  //   }
  //
  //   // if(!expandedRow)
  //   // {
  //   // dd = {
  //   //   pageSize : 'A4',
  //   //   pageOrientation: 'landscape',
  //   //   styles: {
  //   //     test: headerStyle,
  //   //     testCell : {
  //   //       color: '#413a90',
  //   //       font: 'normal normal normal 14px/25px Geomanist-Bold',
  //   //       borderradius: '2px',
  //   //       background:'pink'
  //   //     }
  //   //   },
  //   //   // defaultStyle: {
  //   //   //   font: 'MyFontName'
  //   //   // },
  //   //   content:[
  //   //     {
  //   //       style: '',
  //   //       layout: {
  //   //         fillColor: function (rowIndex, node, columnIndex) {
  //   //           return (rowIndex % 2 === 0) ? '#edf1f7' : null;
  //   //         },
  //   //         hLineWidth: function (i, node) {
  //   //           return (i === 0 || i === node.table.body.length) ? 1 : 1;
  //   //         },
  //   //         vLineWidth: function (i, node) {
  //   //           return (i === 0 || i === node.table.widths.length) ? 1 : 0;
  //   //         },
  //   //         hLineColor: function (i, node) {
  //   //           return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //         },
  //   //         vLineColor: function (i, node) {
  //   //           return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //         },
  //   //       },
  //   //       table:{
  //   //         widths:['10%','10%','10%','10%','10%','10%','10%','10%','10%','10%'],
  //   //         dontBreakRows:true,
  //   //         body: [
  //   //           tableHeader,
  //   //           ["",gridData[0].transactionCreationDate,gridData[0].amount,gridData[0].transactionReference,gridData[0].transactionDate],
  //   //           ["",gridData[1].transactionCreationDate,gridData[1].amount,gridData[1].transactionReference,gridData[1].transactionDate],
  //   //         ]
  //   //       }
  //   //     }
  //   //   ],
  //   // };
  //   // }else{
  //   //   console.log(tableSubHeader);
  //
  //   //   dd = {
  //   //     pageSize : 'A4',
  //   //     pageOrientation: 'landscape',
  //   //     styles: {
  //   //       test: headerStyle,
  //   //       testCell : {
  //   //         color: '#413a90',
  //   //         font: 'normal normal normal 14px/25px Geomanist-Bold',
  //   //         borderradius: '2px',
  //   //         background:'pink'
  //   //       }
  //   //     },
  //   //     // defaultStyle: {
  //   //     //   font: 'MyFontName'
  //   //     // },
  //   //     content:[
  //   //       {
  //   //         style: '',
  //   //         layout: {
  //   //           fillColor: function (rowIndex, node, columnIndex) {
  //   //             return (rowIndex % 2 === 0) ? '#edf1f7' : null;
  //   //           },
  //   //           hLineWidth: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? 1 : 1;
  //   //           },
  //   //           vLineWidth: function (i, node) {
  //   //             return (i === 0 || i === node.table.widths.length) ? 1 : 0;
  //   //           },
  //   //           hLineColor: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //           },
  //   //           vLineColor: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //           },
  //   //         },
  //   //         table:{
  //   //           widths:['9%','9%','9%','9%','9%','9%','9%','9%','9%','9%',"9%","9%","9%"],
  //   //           dontBreakRows:true,
  //   //           body: [
  //   //             tableHeader,
  //   //             [gridData[0].transactionUuid,"","",gridData[0].cardHolderEnName,gridData[0].netAmount,gridData[0].vatAmount,gridData[0].grossAmount,gridData[0].siteEnName,gridData[0].cityEnName,gridData[0].zoneEnName,gridData[0].transactionCreationDate],
  //   //             // [gridData[1].transactionUuid,"","",gridData[1].cardHolderEnName,gridData[1].netAmount,gridData[1].vatAmount,gridData[1].grossAmount,gridData[1].siteEnName,gridData[1].cityEnName,gridData[1].zoneEnName,gridData[1].transactionCreationDate],
  //   //           ]
  //   //         },
  //
  //   //       },
  //   //       {
  //   //         layout: {
  //   //           fillColor: function (rowIndex, node, columnIndex) {
  //   //             return (rowIndex % 2 === 0) ? '#edf1f7' : null;
  //   //           },
  //   //           hLineWidth: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? 1 : 1;
  //   //           },
  //   //           vLineWidth: function (i, node) {
  //   //             return (i === 0 || i === node.table.widths.length) ? 1 : 0;
  //   //           },
  //   //           hLineColor: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //           },
  //   //           vLineColor: function (i, node) {
  //   //             return (i === 0 || i === node.table.body.length) ? '#E3E5E5' : '#E3E5E5';
  //   //           },
  //   //         },
  //   //         table:{
  //   //           widths:['8%','8%','8%','8%','8%','8%','8%','8%','8%','8%',"8%","8%"],
  //   //           dontBreakRows:true,
  //   //           body: [
  //   //             tableSubHeader,
  //   //             [gridData[0].transactionItemReportDtoList[0].vehiclePlateNumber,gridData[0].transactionItemReportDtoList[0].assetNfcSerialNumber,gridData[0].transactionItemReportDtoList[0].assetType,gridData[0].transactionItemReportDtoList[0].assetSuspended,gridData[0].transactionItemReportDtoList[0].productCategoryEnName,gridData[0].transactionItemReportDtoList[0].productEnName,gridData[0].transactionItemReportDtoList[0].policyEnName,gridData[0].transactionItemReportDtoList[0].quantity,gridData[0].transactionItemReportDtoList[0].currentMileage,gridData[0].transactionItemReportDtoList[0].netAmount,gridData[0].transactionItemReportDtoList[0].vatAmount,10],
  //   //           ]
  //   //         },
  //   //       }
  //   //     ],
  //   //   };
  //
  //   // }
  //
  //   // qrCode code
  //   //     dd={
  //   //   pageSize : 'A4',
  //   //   pageOrientation: 'landscape',
  //   //   content:[
  //   //     {qr:qrData}
  //   //   ]
  //   // }
  //
  //
  //   pdfMake.createPdf(dd).download('test.pdf');
  // }

  Convert_HTML_To_PDF(htmlContent: any) {
    var doc = new jsPDF();

    doc.html(htmlContent, {
      callback: function (doc) {
        // Save the PDF
        doc.save('document-html.pdf');
      },
      margin: [10, 10, 10, 10],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 190, //target width in the PDF document
      windowWidth: 675 //window width in CSS pixels
    });
  }

  exportAsPDF(htmlContent: any, filename: string, defaultPrint = true) {
    if (defaultPrint) {
      window.print()
    } else {
      // html2canvas(htmlContent, { allowTaint: true }).then(canvas => {
      //   let HTML_Width = canvas.width;
      //   let HTML_Height = canvas.height;
      //   let top_left_margin = 15;
      //   let PDF_Width = HTML_Width + (top_left_margin * 2);
      //   let PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
      //   let canvas_image_width = HTML_Width;
      //   let canvas_image_height = HTML_Height;
      //   let totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
      //   canvas.getContext('2d');
      //   let imgData = canvas.toDataURL("image/jpeg", 1.0);
      //   let pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      //   pdf.addImage(imgData, 'JPEG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
      //   for (let i = 1; i <= totalPDFPages; i++) {
      //     pdf.addPage([PDF_Width, PDF_Height], 'p');
      //     pdf.addImage(imgData, 'JPEG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      //   }
      //   pdf.save(`${filename}.pdf`);
      // })
        html2canvas(htmlContent, { allowTaint: true }).then(canvas => {
       
        let HTML_Width = +canvas.style.width.split('px')[0];
        let HTML_Height =+canvas.style.height.split('px')[0];
          // Define A4 dimensions (in pixels)
          
        const A4_WIDTH = 595;  // approximately 210mm converted to pixels
        const A4_HEIGHT = 842; // approximately 297mm converted to pixels
        let scaleFactor = Math.min(A4_WIDTH / HTML_Width);

        let PDF_Width = HTML_Width*scaleFactor  ;
        let PDF_Height = HTML_Height *scaleFactor;
        let canvas_image_width = PDF_Width;
        let canvas_image_height = PDF_Height;
        let totalPDFPages = Math.ceil(HTML_Height / canvas.height  ) - 1;
        let imgData = canvas.toDataURL("image/jpeg");
        let pdf = new jsPDF('p', 'pt', [A4_WIDTH, A4_HEIGHT]);
        pdf.addImage(imgData, 'JPEG',(A4_WIDTH - PDF_Width) / 2, (A4_HEIGHT - PDF_Height) / 2, canvas_image_width, canvas_image_height);
        for (let i = 1; i <= totalPDFPages; i++) {
          pdf.addPage([A4_WIDTH, A4_HEIGHT], 'p');
          pdf.addImage(imgData, 'JPEG', (A4_WIDTH - PDF_Width) / 2, -((A4_HEIGHT - PDF_Height) / 2 * i) , canvas_image_width, canvas_image_height);
        }
        pdf.save(`${filename}.pdf`);
      })
    }
  }

  // exportInvoiceAsPDF(htmlContent: any, filename: string) {
  //   html2pdf(htmlContent, {filename});
  // }

  exportInvoiceAsPDF(htmlContent: any, filename: string) {
    const opt = {
      margin: 0.25,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '#printable-sale' },
      html2canvas: { scale: 2, allowTaint: false, imageTimeout: 15000 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape', compress: true, putOnlyUsedFonts: true },
    };
    html2pdf().set(opt).from(htmlContent).save();
    // html2pdf(htmlContent, {filename});
  }

}
