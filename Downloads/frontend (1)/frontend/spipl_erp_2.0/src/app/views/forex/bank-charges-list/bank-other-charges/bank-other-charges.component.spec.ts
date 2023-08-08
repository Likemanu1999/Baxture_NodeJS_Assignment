import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankOtherChargesComponent } from './bank-other-charges.component';

describe('BankOtherChargesComponent', () => {
  let component: BankOtherChargesComponent;
  let fixture: ComponentFixture<BankOtherChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankOtherChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankOtherChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
