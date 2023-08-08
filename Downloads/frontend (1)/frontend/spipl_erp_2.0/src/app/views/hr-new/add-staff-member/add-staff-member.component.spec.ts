import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStaffMemberComponent } from './add-staff-member.component';

describe('AddStaffMemberComponent', () => {
  let component: AddStaffMemberComponent;
  let fixture: ComponentFixture<AddStaffMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStaffMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStaffMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
