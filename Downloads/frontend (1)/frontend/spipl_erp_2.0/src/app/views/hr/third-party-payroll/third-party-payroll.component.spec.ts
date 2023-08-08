import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyPayrollComponent } from './third-party-payroll.component';

describe('ThirdPartyPayrollComponent', () => {
  let component: ThirdPartyPayrollComponent;
  let fixture: ComponentFixture<ThirdPartyPayrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThirdPartyPayrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdPartyPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
