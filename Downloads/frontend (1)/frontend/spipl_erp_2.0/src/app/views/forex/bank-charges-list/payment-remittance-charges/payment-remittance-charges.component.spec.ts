import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRemittanceChargesComponent } from './payment-remittance-charges.component';

describe('PaymentRemittanceChargesComponent', () => {
  let component: PaymentRemittanceChargesComponent;
  let fixture: ComponentFixture<PaymentRemittanceChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentRemittanceChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentRemittanceChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
