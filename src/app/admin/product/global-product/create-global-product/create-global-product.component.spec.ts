import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGlobalProductComponent } from './create-global-product.component';

describe('CreateGlobalProductComponent', () => {
  let component: CreateGlobalProductComponent;
  let fixture: ComponentFixture<CreateGlobalProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateGlobalProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGlobalProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
