import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchPaymentComponent } from './dispatch-payment.component';

describe('DispatchPaymentComponent', () => {
  let component: DispatchPaymentComponent;
  let fixture: ComponentFixture<DispatchPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
