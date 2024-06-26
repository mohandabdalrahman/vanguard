import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-details-withicon',
  templateUrl: './info-details-icon.component.html',
  styleUrls: ['./info-details-icon.component.scss']
})
export class InfoDetailsWithIconComponent implements OnInit {
  @Input() title: string;
  @Input() name: string;
  @Input() unitName: string;
  @Input() length: number;
  
  @Input() icon: string ;;
  @Input() iconbBackground: string = './assets/img/icons-corporates.svg';
  constructor() { }

  ngOnInit(): void {
  }

}
