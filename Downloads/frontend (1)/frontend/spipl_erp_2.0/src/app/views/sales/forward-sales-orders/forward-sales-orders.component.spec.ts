import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardSalesOrdersComponent } from './forward-sales-orders.component';

describe('ForwardSalesOrdersComponent', () => {
  let component: ForwardSalesOrdersComponent;
  let fixture: ComponentFixture<ForwardSalesOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwardSalesOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardSalesOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
