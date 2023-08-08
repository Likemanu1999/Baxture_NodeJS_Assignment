import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAverageReportNewComponent } from './sales-average-report-new.component';

describe('SalesAverageReportNewComponent', () => {
  let component: SalesAverageReportNewComponent;
  let fixture: ComponentFixture<SalesAverageReportNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesAverageReportNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesAverageReportNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
