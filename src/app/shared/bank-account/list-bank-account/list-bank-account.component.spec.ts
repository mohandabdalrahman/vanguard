import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBankAccountComponent } from './list-bank-account.component';

describe('ListBankAccountComponent', () => {
  let component: ListBankAccountComponent;
  let fixture: ComponentFixture<ListBankAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBankAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
