import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportClearanceReportComponent } from './import-clearance-report.component';

describe('ImportClearanceReportComponent', () => {
  let component: ImportClearanceReportComponent;
  let fixture: ComponentFixture<ImportClearanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportClearanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportClearanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
