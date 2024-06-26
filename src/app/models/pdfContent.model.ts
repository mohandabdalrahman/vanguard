import { ColData } from "./column-data.model";

export class PdfContent {
    pageSize?: string = 'A4';
    pageOrientation?: string;
    styles?;
    defaultStyle?;
    images?;
    header?;
    footer?;
    pageMargins?: number[];
    content: {}[];
    pageBreakBefore?;
    pageBreak?;
}

export interface PdfTableStructure {
    body?: string[] | {}[];
    columnWidths?: string[];
}

export interface PdfComponentsWidth {
    titleSizeOne?: number;
    titleSizeTwo?: number;
    tableLabelWidth?: number;
    tableValueWidth?: number;
    tableHeaderWidth?: number;
}

export interface PdfAboutInformation {
    fileName?: string;
    lang?: string;
}

export interface DataTable {
    colData?: ColData[];
    gridData?: any;
} 
export interface MetaData{
    merchantName?: string;
    headerTitle?: string;
}
export interface DataLabel{
    pageHeaderData?:  ColData[];
    noBorderDivData?: ColData[];
    groupOneData?: ColData[];
    groupTwoData?: ColData[];
    totalsData?: ColData[];
}
export interface PdfData {
    dataLabel?: DataLabel;
    dataTable?: DataTable;
    metaData?: MetaData;
}
export interface PdfProperties {
    pdfData?: PdfData[] ;
    pdfComponentsWidth?: PdfComponentsWidth;
    pdfAboutInfo?: PdfAboutInformation;
}