import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAverageReportComponent } from './sales-average-report.component';

describe('SalesAverageReportComponent', () => {
  let component: SalesAverageReportComponent;
  let fixture: ComponentFixture<SalesAverageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesAverageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesAverageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
