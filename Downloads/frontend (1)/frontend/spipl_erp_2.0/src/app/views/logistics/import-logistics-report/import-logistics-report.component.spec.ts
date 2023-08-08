import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLogisticsReportComponent } from './import-logistics-report.component';

describe('ImportLogisticsReportComponent', () => {
  let component: ImportLogisticsReportComponent;
  let fixture: ComponentFixture<ImportLogisticsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportLogisticsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLogisticsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
