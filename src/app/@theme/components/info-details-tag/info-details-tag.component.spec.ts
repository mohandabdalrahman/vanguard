import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDetailsTagComponent } from './info-details-tag.component';

describe('InfoDetailsTagComponent', () => {
  let component: InfoDetailsTagComponent;
  let fixture: ComponentFixture<InfoDetailsTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDetailsTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDetailsTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
