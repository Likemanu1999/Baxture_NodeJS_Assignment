import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRegisterImportReportNewComponent } from './purchase-register-import-report-new.component';

describe('PurchaseRegisterImportReportNewComponent', () => {
  let component: PurchaseRegisterImportReportNewComponent;
  let fixture: ComponentFixture<PurchaseRegisterImportReportNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseRegisterImportReportNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRegisterImportReportNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
