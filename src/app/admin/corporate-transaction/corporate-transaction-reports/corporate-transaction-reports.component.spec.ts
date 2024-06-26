import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateTransactionReportsComponent } from './corporate-transaction-reports.component';

describe('CorporateTransactionReportsComponent', () => {
  let component: CorporateTransactionReportsComponent;
  let fixture: ComponentFixture<CorporateTransactionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateTransactionReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateTransactionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
