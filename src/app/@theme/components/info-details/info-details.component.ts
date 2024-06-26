import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-details',
  templateUrl: './info-details.component.html',
  styleUrls: ['./info-details.component.scss']
})
export class InfoDetailsComponent implements OnInit {
  @Input() head: string;
  @Input() body: string;
  @Input() useStatus:boolean=false
  @Input() useIcon:boolean=false
  @Input() usePlateComponent:boolean=false
  @Input() suspended:boolean=true
  @Input() plateNumber:string
  @Input() useColon:boolean=false
  @Input() addClass=''
  @Input() backGroundClass=''
  @Input() bodyTextColor=""
  @Input() bodyTextSize=""
  @Input() image:string=""
  constructor() { }

  ngOnInit(): void {
  }

}
