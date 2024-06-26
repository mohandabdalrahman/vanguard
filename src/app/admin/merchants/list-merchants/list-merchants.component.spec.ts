import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMerchantsComponent } from './list-merchants.component';

describe('ListMerchantsComponent', () => {
  let component: ListMerchantsComponent;
  let fixture: ComponentFixture<ListMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
