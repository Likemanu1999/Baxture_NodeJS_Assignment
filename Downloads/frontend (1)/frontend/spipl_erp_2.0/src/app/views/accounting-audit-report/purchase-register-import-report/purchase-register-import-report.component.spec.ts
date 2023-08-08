import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRegisterImportReportComponent } from './purchase-register-import-report.component';

describe('PurchaseRegisterImportReportComponent', () => {
  let component: PurchaseRegisterImportReportComponent;
  let fixture: ComponentFixture<PurchaseRegisterImportReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseRegisterImportReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRegisterImportReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
