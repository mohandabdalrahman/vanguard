import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCardHolderComponent } from './update-card-holder.component';

describe('UpdateCardHolderComponent', () => {
  let component: UpdateCardHolderComponent;
  let fixture: ComponentFixture<UpdateCardHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCardHolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCardHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
