import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverwriteConfirmModalComponent } from './overwrite-confirm-modal.component';

describe('OverwriteConfirmModalComponent', () => {
  let component: OverwriteConfirmModalComponent;
  let fixture: ComponentFixture<OverwriteConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverwriteConfirmModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverwriteConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
