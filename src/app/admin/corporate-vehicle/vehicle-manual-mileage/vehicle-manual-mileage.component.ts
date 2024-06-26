import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {SubSink} from "subsink";
import {ActivatedRoute} from "@angular/router";
import {getRelatedSystemId} from "@helpers/related-systemid";

@Component({
  selector: 'app-vehicle-manual-mileage',
  templateUrl: './vehicle-manual-mileage.component.html',
  styleUrls: ['./vehicle-manual-mileage.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class VehicleManualMileageComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  corporateId: number;

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.subs.add(
      this.route.parent.params.subscribe((params) => {
        this.corporateId = +getRelatedSystemId(params, "corporateId");
      }),
    )
  }

  handleDateChange(date: string) {
    console.log(date)
  }




  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
