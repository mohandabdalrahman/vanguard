import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTransactionReviewStatusComponent } from './admin-transaction-review-status.component';

describe('AdminTransactionReportsComponent', () => {
  let component: AdminTransactionReviewStatusComponent;
  let fixture: ComponentFixture<AdminTransactionReviewStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTransactionReviewStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTransactionReviewStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
