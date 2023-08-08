import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignPurchseContractAverageReportComponent } from './foreign-purchse-contract-average-report.component';

describe('ForeignPurchseContractAverageReportComponent', () => {
  let component: ForeignPurchseContractAverageReportComponent;
  let fixture: ComponentFixture<ForeignPurchseContractAverageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForeignPurchseContractAverageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForeignPurchseContractAverageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
