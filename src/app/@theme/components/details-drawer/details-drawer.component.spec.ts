import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDrawerComponent } from './details-drawer.component';

describe('DetailsDrawerComponent', () => {
  let component: DetailsDrawerComponent;
  let fixture: ComponentFixture<DetailsDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
