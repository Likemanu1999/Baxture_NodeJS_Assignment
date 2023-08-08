import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddlewarePaymentsRevampComponent } from './middleware-payments-revamp.component';

describe('MiddlewarePaymentsRevampComponent', () => {
  let component: MiddlewarePaymentsRevampComponent;
  let fixture: ComponentFixture<MiddlewarePaymentsRevampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiddlewarePaymentsRevampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiddlewarePaymentsRevampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
