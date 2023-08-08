import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalOutstandingReportComponent } from './local-outstanding-report.component';

describe('LocalOutstandingReportComponent', () => {
  let component: LocalOutstandingReportComponent;
  let fixture: ComponentFixture<LocalOutstandingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalOutstandingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalOutstandingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
