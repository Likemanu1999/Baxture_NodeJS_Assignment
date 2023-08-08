import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfExchangeComponent } from './bill-of-exchange.component';

describe('BillOfExchangeComponent', () => {
  let component: BillOfExchangeComponent;
  let fixture: ComponentFixture<BillOfExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
