import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPurchaseChargesComponent } from './local-purchase-charges.component';

describe('LocalPurchaseChargesComponent', () => {
  let component: LocalPurchaseChargesComponent;
  let fixture: ComponentFixture<LocalPurchaseChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalPurchaseChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPurchaseChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
