import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLimitViewComponent } from './all-limit-view.component';

describe('AllLimitViewComponent', () => {
  let component: AllLimitViewComponent;
  let fixture: ComponentFixture<AllLimitViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllLimitViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllLimitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
