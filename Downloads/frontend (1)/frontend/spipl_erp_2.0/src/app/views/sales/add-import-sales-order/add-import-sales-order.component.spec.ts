import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImportSalesOrderComponent } from './add-import-sales-order.component';

describe('AddImportSalesOrderComponent', () => {
  let component: AddImportSalesOrderComponent;
  let fixture: ComponentFixture<AddImportSalesOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImportSalesOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddImportSalesOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
