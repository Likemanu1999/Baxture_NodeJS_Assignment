import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageGradeRateReportComponent } from './average-grade-rate-report.component';

describe('AverageGradeRateReportComponent', () => {
  let component: AverageGradeRateReportComponent;
  let fixture: ComponentFixture<AverageGradeRateReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AverageGradeRateReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AverageGradeRateReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
