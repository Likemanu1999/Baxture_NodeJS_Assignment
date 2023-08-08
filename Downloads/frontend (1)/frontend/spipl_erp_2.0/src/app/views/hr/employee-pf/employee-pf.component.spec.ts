import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePfComponent } from './employee-pf.component';

describe('EmployeePfComponent', () => {
  let component: EmployeePfComponent;
  let fixture: ComponentFixture<EmployeePfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
