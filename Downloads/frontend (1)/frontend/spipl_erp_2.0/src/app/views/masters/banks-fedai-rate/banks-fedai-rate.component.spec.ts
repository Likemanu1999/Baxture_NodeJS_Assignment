import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BanksFedaiRateComponent } from './banks-fedai-rate.component';

describe('BanksFedaiRateComponent', () => {
  let component: BanksFedaiRateComponent;
  let fixture: ComponentFixture<BanksFedaiRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BanksFedaiRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BanksFedaiRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
