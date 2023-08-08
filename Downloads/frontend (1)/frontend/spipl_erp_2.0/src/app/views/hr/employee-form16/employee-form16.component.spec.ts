import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeForm16Component } from './employee-form16.component';

describe('EmployeeForm16Component', () => {
  let component: EmployeeForm16Component;
  let fixture: ComponentFixture<EmployeeForm16Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeForm16Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeForm16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
