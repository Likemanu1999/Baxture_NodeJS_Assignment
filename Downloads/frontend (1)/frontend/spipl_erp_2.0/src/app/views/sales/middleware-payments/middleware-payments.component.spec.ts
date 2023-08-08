import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddlewarePaymentsComponent } from './middleware-payments.component';

describe('MiddlewarePaymentsComponent', () => {
  let component: MiddlewarePaymentsComponent;
  let fixture: ComponentFixture<MiddlewarePaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiddlewarePaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiddlewarePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
