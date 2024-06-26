import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHolderDetailComponent } from './card-holder-detail.component';

describe('CardHolderDetailComponent', () => {
  let component: CardHolderDetailComponent;
  let fixture: ComponentFixture<CardHolderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardHolderDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
