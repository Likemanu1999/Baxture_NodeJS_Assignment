import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPurchasePriceListComponent } from './sales-purchase-price-list.component';

describe('SalesPurchasePriceListComponent', () => {
  let component: SalesPurchasePriceListComponent;
  let fixture: ComponentFixture<SalesPurchasePriceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesPurchasePriceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPurchasePriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
