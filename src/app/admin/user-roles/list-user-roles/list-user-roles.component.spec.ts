import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserRolesComponent } from './list-user-roles.component';

describe('ListUserRolesComponent', () => {
  let component: ListUserRolesComponent;
  let fixture: ComponentFixture<ListUserRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListUserRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListUserRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
