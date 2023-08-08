import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportForexReportComponent } from './import-forex-report.component';

describe('ImportForexReportComponent', () => {
  let component: ImportForexReportComponent;
  let fixture: ComponentFixture<ImportForexReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportForexReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportForexReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
