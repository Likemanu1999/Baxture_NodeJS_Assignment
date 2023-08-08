import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierQuantityComponent } from './supplier-quantity.component';

describe('SupplierQuantityComponent', () => {
  let component: SupplierQuantityComponent;
  let fixture: ComponentFixture<SupplierQuantityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierQuantityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
