import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGlobalProductComponent } from './list-global-product.component';

describe('ListGlobalProductComponent', () => {
  let component: ListGlobalProductComponent;
  let fixture: ComponentFixture<ListGlobalProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListGlobalProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListGlobalProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
