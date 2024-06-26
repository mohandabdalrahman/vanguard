import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMasterMerchantComponent } from './create-master-merchant.component';

describe('CreateMasterMerchantComponent', () => {
  let component: CreateMasterMerchantComponent;
  let fixture: ComponentFixture<CreateMasterMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMasterMerchantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMasterMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
