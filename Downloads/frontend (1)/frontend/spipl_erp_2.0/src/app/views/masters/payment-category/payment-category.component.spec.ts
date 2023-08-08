import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCategoryComponent } from './payment-category.component';

describe('PaymentCategoryComponent', () => {
  let component: PaymentCategoryComponent;
  let fixture: ComponentFixture<PaymentCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
