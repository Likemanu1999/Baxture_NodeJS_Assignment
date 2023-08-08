import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderLocalReportComponent } from './sales-order-local-report.component';

describe('SalesOrderLocalReportComponent', () => {
  let component: SalesOrderLocalReportComponent;
  let fixture: ComponentFixture<SalesOrderLocalReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderLocalReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderLocalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
