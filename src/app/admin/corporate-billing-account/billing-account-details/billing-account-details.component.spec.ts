import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingAccountDetailsComponent } from './billing-account-details.component';

describe('BillingAccountDetailsComponent', () => {
  let component: BillingAccountDetailsComponent;
  let fixture: ComponentFixture<BillingAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
