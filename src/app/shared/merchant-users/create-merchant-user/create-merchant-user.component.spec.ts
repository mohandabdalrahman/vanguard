import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMerchantUserComponent } from './create-merchant-user.component';

describe('CreateMerchantUserComponent', () => {
  let component: CreateMerchantUserComponent;
  let fixture: ComponentFixture<CreateMerchantUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMerchantUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMerchantUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
