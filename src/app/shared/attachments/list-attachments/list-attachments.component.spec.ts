import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAttachmentsComponent } from './list-attachments.component';

describe('ListAttachmentsComponent', () => {
  let component: ListAttachmentsComponent;
  let fixture: ComponentFixture<ListAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListAttachmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
