import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionRateComponent } from './consumption-rate.component';

describe('ConsumptionRateComponent', () => {
  let component: ConsumptionRateComponent;
  let fixture: ComponentFixture<ConsumptionRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumptionRateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumptionRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
