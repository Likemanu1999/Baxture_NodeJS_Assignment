import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsChargesReportComponent } from './logistics-charges-report.component';

describe('LogisticsChargesReportComponent', () => {
  let component: LogisticsChargesReportComponent;
  let fixture: ComponentFixture<LogisticsChargesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogisticsChargesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogisticsChargesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
