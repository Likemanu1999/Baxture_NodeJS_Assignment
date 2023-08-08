import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardSalesOutstandingComponent } from './forward-sales-outstanding.component';

describe('ForwardSalesOutstandingComponent', () => {
  let component: ForwardSalesOutstandingComponent;
  let fixture: ComponentFixture<ForwardSalesOutstandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwardSalesOutstandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardSalesOutstandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
