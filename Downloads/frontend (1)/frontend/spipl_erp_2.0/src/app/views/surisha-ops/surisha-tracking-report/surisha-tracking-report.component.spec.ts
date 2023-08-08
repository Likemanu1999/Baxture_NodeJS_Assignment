import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurishaTrackingReportComponent } from './surisha-tracking-report.component';

describe('SurishaTrackingReportComponent', () => {
  let component: SurishaTrackingReportComponent;
  let fixture: ComponentFixture<SurishaTrackingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurishaTrackingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurishaTrackingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
