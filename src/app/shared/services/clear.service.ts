import {Injectable} from '@angular/core';
import {CorporateOuService} from "../../admin/organizational-chart/corporate-ou.service";

@Injectable({
  providedIn: 'root'
})
export class ClearService {

  constructor(private corporateOuService: CorporateOuService) {
  }

  clear() {
    this.corporateOuService.selectedOuNode = null;
  }
}
