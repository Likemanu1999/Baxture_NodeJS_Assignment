import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPurchaseShortDamageComponent } from './local-purchase-short-damage.component';

describe('LocalPurchaseShortDamageComponent', () => {
  let component: LocalPurchaseShortDamageComponent;
  let fixture: ComponentFixture<LocalPurchaseShortDamageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalPurchaseShortDamageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPurchaseShortDamageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
