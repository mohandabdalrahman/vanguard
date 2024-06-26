import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ColData} from "@models/column-data.model";
import {SortView} from "@models/sort-view.model";
import {CellData} from "@models/cell-data.model";
import {Router} from "@angular/router";
import {AuthService} from "../../../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: "app-data-table",
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"],
})
export class DataTableComponent implements OnInit {
  @Input() gridData: any;
  @Input() colData: ColData[] = [];
  @Input() itemsColData: ColData[] = [];
  @Input() tableInsideTab = false;
  @Input() viewLink: string;
  @Input() tableControls = true;
  @Input() placeViews: { text: string; route: string }[] = [];
  @Input() enableCheckBox = false;
  @Input() enableSelectAll = false;
  @Input() merchantId: number;
  @Input() showTopContainer = true
  @Input() fileName: number;
  @Output() onItemSelect = new EventEmitter();
  @Output() onCellClick = new EventEmitter();
  @Output() onEditBtnClick = new EventEmitter();
  @Output() onSortChange = new EventEmitter<SortView>();
  @Input() showView = true;
  @Input() showDelete = true;
  @Input() showUpdate = true;
  @Input() showInvoice = false;
  @Input() saleView = false;
  @Input() enableSorting = false;
  @Input() entityName: string;
  @Input() selectRow = false;
  @Input() showEditBtn = false;
  @Input() Goto: string;
  enableSortIcon=false
  toggleRow = false;
  selected = [];
  currentUrl: string;
  checkedCheckbox: string[] = [];
  userType: string;
  currentLang: string
  @Input() role: string;
  @Input() price: number;
  @Input() isOpened = false;
  @Input() addHeaderClass = false;

  constructor(private router: Router, private authService: AuthService, private translate: TranslateService, private currentLangService: CurrentLangService,) {
  }


  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.translate.onLangChange.subscribe(({lang}) => {
      this.currentLang = lang;
    })
    this.currentUrl = this.router.url.split("/").pop();
    this.userType = this.authService.getUserType();
    this.checkedCheckbox =
      JSON.parse(sessionStorage.getItem("checkedCheckbox")) || [];
  }

  onSelect(checked: boolean, record, checkboxId?: string) {

    if (record.hasOwnProperty('settled')) {
      record.settled = !record.settled;
      if (checked && record.settled) {
        if (this.selectRow) {
          this.selected.push(record);
        } else {
          this.selected.push(record.id);
        }
        if (checkboxId) {
          this.checkedCheckbox.push(checkboxId);
        }
      } else {
        const recordIndex = this.selected.findIndex((item) => item.id === record.id);
        if (recordIndex > -1) {
          this.selected.splice(recordIndex, 1);
        }
        if (this.checkedCheckbox.indexOf(checkboxId) >= 0) {
          this.checkedCheckbox.splice(
            this.checkedCheckbox.indexOf(checkboxId),
            1
          );
        }
      }
    } else {
      if (checked) {
        if (this.selectRow) {
          this.selected.push(record);
        } else {
          this.selected.push(record.id);
        }
        if (checkboxId) {
          this.checkedCheckbox.push(checkboxId);
        }
      } else {
        const recordIndex = this.selected.findIndex((item) => item.id === record.id);
        if (recordIndex > -1) {
          this.selected.splice(recordIndex, 1);
        }
        if (this.checkedCheckbox.indexOf(checkboxId) >= 0) {
          this.checkedCheckbox.splice(
            this.checkedCheckbox.indexOf(checkboxId),
            1
          );
        }
      }
    }

    sessionStorage.setItem(
      "checkedCheckbox",
      JSON.stringify(this.checkedCheckbox)
    );
    this.onItemSelect.emit(this.selected);
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.gridData.forEach((record) => {
        record.settled = true;
        if (this.selectRow) {
          this.selected.push(record);
        } else {
          this.selected.push(record.id);
        }
      });
    } else {
      this.gridData.forEach((record) => {
        record.settled = false;
      });
      this.selected = [];
    }
    this.onItemSelect.emit(this.selected);
  }

  handleSortView(sortDirection: string, sortBy: string) {
    if (sortBy === "status") {
      this.onSortChange.emit({sortDirection, sortBy: "suspended"});
    } else if (sortBy === "country") {
      this.onSortChange.emit({sortDirection, sortBy: "countryId"});
    } else if (sortBy === "contactType") {
      this.onSortChange.emit({sortDirection, sortBy: "contactTypeId"});
    } else if (sortBy === "totalValue") {
      this.onSortChange.emit({sortDirection, sortBy: "totalAmount"});
    } else if (sortBy === "settledAction") {
      this.onSortChange.emit({sortDirection, sortBy: "settled"});
    } else {
      this.onSortChange.emit({sortDirection, sortBy});
    }
  }

  handleCellClick(cellData: CellData) {
    if (cellData) {
      this.onCellClick.emit(cellData);
    }
  }

  calculateDailyOperatingValues(record: any, name: 'liters' | 'kiloMeters' | 'exchangeLimit') {
    const consumptionRate = record['consumptionDefaultRate'] || record['averageCalculatedConsumption']
    switch (name) {
      case 'liters':
        record['exchangeLimit'] = (+record['liters'] && this.price) ? +record['liters'] * this.price : null;
        record['kilometers'] = +record['liters'] ? (+record['liters'] * 100) / consumptionRate : null;
        break;
      case 'exchangeLimit':
        record['liters'] = (+record['exchangeLimit'] && this.price) ? +record['exchangeLimit'] / this.price : null;
        record['kilometers'] = +record['liters'] ? (+record['liters'] * 100) / consumptionRate : null;
        break;
      case 'kiloMeters':
        record['liters'] = +record['kilometers'] ? (+record['kilometers'] * consumptionRate) / 100 : null;
        record['exchangeLimit'] = (+record['liters'] && this.price) ? +record['liters'] * this.price : null;
        break;
    }
  }

  isProductCategoryIdDifferent(record: any): boolean {
    return record['assetPolicies'].some(policy => policy['productCategoryId'] == record['assignedPolicyProductCategoryId'])
  }

  handleEditBtnClick(recordData: any) {
    this.onEditBtnClick.emit(recordData);
  }
}