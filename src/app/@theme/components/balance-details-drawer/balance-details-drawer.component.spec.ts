import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDetailsDrawerComponent } from './balance-details-drawer.component';

describe('DetailsDrawerComponent', () => {
  let component: BalanceDetailsDrawerComponent;
  let fixture: ComponentFixture<BalanceDetailsDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceDetailsDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceDetailsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
