import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderImportReportComponent } from './sales-order-import-report.component';

describe('SalesOrderImportReportComponent', () => {
  let component: SalesOrderImportReportComponent;
  let fixture: ComponentFixture<SalesOrderImportReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderImportReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderImportReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
