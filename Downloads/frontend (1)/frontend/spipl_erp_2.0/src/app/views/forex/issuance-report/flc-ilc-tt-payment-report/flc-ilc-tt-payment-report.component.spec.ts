import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlcIlcTtPaymentReportComponent } from './flc-ilc-tt-payment-report.component';

describe('FlcIlcTtPaymentReportComponent', () => {
  let component: FlcIlcTtPaymentReportComponent;
  let fixture: ComponentFixture<FlcIlcTtPaymentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlcIlcTtPaymentReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlcIlcTtPaymentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
