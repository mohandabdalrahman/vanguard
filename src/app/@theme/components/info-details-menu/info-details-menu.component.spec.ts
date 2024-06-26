import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDetailsMenuComponent } from './info-details-menu.component';

describe('InfoDetailsMenuComponent', () => {
  let component: InfoDetailsMenuComponent;
  let fixture: ComponentFixture<InfoDetailsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDetailsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDetailsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
