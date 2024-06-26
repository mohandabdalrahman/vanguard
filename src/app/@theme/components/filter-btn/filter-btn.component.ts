import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-filter-btn',
    templateUrl: './filter-btn.component.html',
    styleUrls: ['./filter-btn.component.scss']
})
export class FilterBtnComponent implements OnInit {

  showAdvanceSearch: boolean;

    constructor() {
    }

    ngOnInit(): void {
    }

}
