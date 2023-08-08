import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightStockTransferRegisterReportComponent } from './freight-stock-transfer-register-report.component';

describe('FreightStockTransferRegisterReportComponent', () => {
  let component: FreightStockTransferRegisterReportComponent;
  let fixture: ComponentFixture<FreightStockTransferRegisterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightStockTransferRegisterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightStockTransferRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
