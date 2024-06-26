import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-limit-view',
  templateUrl: './all-limit-view.component.html',
  styleUrls: ['./all-limit-view.component.scss']
})
export class AllLimitViewComponent implements OnInit {
  @Input() details
  constructor() { }
  

  ngOnInit(): void {
    
  }


}
