import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {vehicleTabs} from "../vehicle-tabs";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-corporate-vehicle-details',
  templateUrl: './corporate-vehicle-details.component.html',
  styleUrls: ['./corporate-vehicle-details.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CorporateVehicleDetailsComponent implements OnInit {
  tabs = [];
  userType: string;
  affiliatedUnit:string;
  ouEnabled:boolean;
  adminCorporateOuEnabled:boolean;
  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.tabs = vehicleTabs;
    this.affiliatedUnit=JSON.parse(localStorage?.getItem('selectedOuNode'))?.localeName;
    this.ouEnabled=this.authService.isOuEnabled();
    this.adminCorporateOuEnabled=this.authService.isAdminCorporateOuEnabled();
  }

}
