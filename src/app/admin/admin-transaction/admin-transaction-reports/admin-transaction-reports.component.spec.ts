import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTransactionReportsComponent } from './admin-transaction-reports.component';

describe('AdminTransactionReportsComponent', () => {
  let component: AdminTransactionReportsComponent;
  let fixture: ComponentFixture<AdminTransactionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTransactionReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTransactionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
