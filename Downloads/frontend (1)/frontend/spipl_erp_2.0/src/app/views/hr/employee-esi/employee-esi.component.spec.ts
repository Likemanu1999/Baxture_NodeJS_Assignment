import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEsiComponent } from './employee-esi.component';

describe('EmployeeEsiComponent', () => {
  let component: EmployeeEsiComponent;
  let fixture: ComponentFixture<EmployeeEsiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeEsiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeEsiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
