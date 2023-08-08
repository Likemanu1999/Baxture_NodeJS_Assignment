import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPurchaseAverageNewComponent } from './sales-purchase-average-new.component';

describe('SalesPurchaseAverageNewComponent', () => {
  let component: SalesPurchaseAverageNewComponent;
  let fixture: ComponentFixture<SalesPurchaseAverageNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesPurchaseAverageNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPurchaseAverageNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
