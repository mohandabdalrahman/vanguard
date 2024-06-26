import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMerchantUsersComponent } from './list-merchant-users.component';

describe('ListMerchantUsersComponent', () => {
  let component: ListMerchantUsersComponent;
  let fixture: ComponentFixture<ListMerchantUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListMerchantUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMerchantUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
