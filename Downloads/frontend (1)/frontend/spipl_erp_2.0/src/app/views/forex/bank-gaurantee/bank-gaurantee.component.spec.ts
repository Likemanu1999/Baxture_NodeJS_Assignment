import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankGauranteeComponent } from './bank-gaurantee.component';

describe('BankGauranteeComponent', () => {
  let component: BankGauranteeComponent;
  let fixture: ComponentFixture<BankGauranteeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankGauranteeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankGauranteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
