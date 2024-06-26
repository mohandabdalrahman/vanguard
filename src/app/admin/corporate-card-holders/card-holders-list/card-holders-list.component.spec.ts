import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHoldersListComponent } from './card-holders-list.component';

describe('CardHoldersListComponent', () => {
  let component: CardHoldersListComponent;
  let fixture: ComponentFixture<CardHoldersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardHoldersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHoldersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
