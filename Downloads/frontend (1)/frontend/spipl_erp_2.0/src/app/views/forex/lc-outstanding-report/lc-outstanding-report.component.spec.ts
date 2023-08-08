import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LcOutstandingReportComponent } from './lc-outstanding-report.component';

describe('LcOutstandingReportComponent', () => {
  let component: LcOutstandingReportComponent;
  let fixture: ComponentFixture<LcOutstandingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LcOutstandingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LcOutstandingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
