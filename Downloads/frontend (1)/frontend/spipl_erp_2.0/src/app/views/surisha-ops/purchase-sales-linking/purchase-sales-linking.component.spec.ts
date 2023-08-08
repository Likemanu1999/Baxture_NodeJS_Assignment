import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSalesLinkingComponent } from './purchase-sales-linking.component';

describe('PurchaseSalesLinkingComponent', () => {
  let component: PurchaseSalesLinkingComponent;
  let fixture: ComponentFixture<PurchaseSalesLinkingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseSalesLinkingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseSalesLinkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
