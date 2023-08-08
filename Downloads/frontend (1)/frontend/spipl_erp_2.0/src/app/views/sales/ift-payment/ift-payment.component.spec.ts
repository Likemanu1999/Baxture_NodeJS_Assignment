import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IftPaymentComponent } from './ift-payment.component';

describe('IftPaymentComponent', () => {
  let component: IftPaymentComponent;
  let fixture: ComponentFixture<IftPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IftPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IftPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
