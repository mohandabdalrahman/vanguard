import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() {
  }

  //TODO ADD RTL AND CHANGE TYPE TO HTMLELEMENT
  exportAsExcelFile(domElement: HTMLElement, excelFileName: string, isRtl = false): void {
    const myWorkSheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(domElement);
    // let myWorkSheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]])
    // XLSX.utils.sheet_add_dom(myWorkSheet, domElement, {origin:"A1"})
    const myWorkBook: XLSX.WorkBook = {
      Sheets: {'data': myWorkSheet},
      SheetNames: ['data'],
      Workbook: {Views: [{RTL: isRtl}]}
    };
    const excelBuffer: any = XLSX.write(myWorkBook, {bookType: 'xlsx', type: 'array'});
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    saveAs(data, fileName + '_exported' + EXCEL_EXTENSION)
  }
}
