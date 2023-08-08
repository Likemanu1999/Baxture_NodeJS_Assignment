import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRegisterLocalReportComponent } from './purchase-register-local-report.component';

describe('PurchaseRegisterLocalReportComponent', () => {
  let component: PurchaseRegisterLocalReportComponent;
  let fixture: ComponentFixture<PurchaseRegisterLocalReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseRegisterLocalReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRegisterLocalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
