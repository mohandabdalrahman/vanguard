import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMasterMerchantsComponent } from './list-master-merchants.component';

describe('ListMasterMerchantsComponent', () => {
  let component: ListMasterMerchantsComponent;
  let fixture: ComponentFixture<ListMasterMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListMasterMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMasterMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
