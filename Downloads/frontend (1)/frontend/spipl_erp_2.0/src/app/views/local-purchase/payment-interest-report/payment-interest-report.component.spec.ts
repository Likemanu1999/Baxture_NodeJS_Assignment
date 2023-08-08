import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInterestReportComponent } from './payment-interest-report.component';

describe('PaymentInterestReportComponent', () => {
  let component: PaymentInterestReportComponent;
  let fixture: ComponentFixture<PaymentInterestReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentInterestReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInterestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
