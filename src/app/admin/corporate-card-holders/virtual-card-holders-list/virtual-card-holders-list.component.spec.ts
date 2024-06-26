import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualCardHoldersListComponent } from './virtual-card-holders-list.component';

describe('VirtualCardHoldersListComponent', () => {
  let component: VirtualCardHoldersListComponent;
  let fixture: ComponentFixture<VirtualCardHoldersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VirtualCardHoldersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualCardHoldersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
