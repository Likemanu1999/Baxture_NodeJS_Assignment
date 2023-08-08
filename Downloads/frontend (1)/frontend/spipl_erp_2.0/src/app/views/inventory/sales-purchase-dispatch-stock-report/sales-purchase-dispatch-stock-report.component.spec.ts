import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPurchaseDispatchStockReportComponent } from './sales-purchase-dispatch-stock-report.component';

describe('SalesPurchaseDispatchStockReportComponent', () => {
  let component: SalesPurchaseDispatchStockReportComponent;
  let fixture: ComponentFixture<SalesPurchaseDispatchStockReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesPurchaseDispatchStockReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPurchaseDispatchStockReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
