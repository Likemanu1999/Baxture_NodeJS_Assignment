import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDiscountReportComponent } from './sales-discount-report.component';

describe('SalesDiscountReportComponent', () => {
  let component: SalesDiscountReportComponent;
  let fixture: ComponentFixture<SalesDiscountReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesDiscountReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesDiscountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
