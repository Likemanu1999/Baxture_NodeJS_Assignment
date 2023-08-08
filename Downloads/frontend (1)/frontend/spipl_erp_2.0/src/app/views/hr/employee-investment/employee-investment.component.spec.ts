import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInvestmentComponent } from './employee-investment.component';

describe('EmployeeInvestmentComponent', () => {
  let component: EmployeeInvestmentComponent;
  let fixture: ComponentFixture<EmployeeInvestmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeInvestmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
