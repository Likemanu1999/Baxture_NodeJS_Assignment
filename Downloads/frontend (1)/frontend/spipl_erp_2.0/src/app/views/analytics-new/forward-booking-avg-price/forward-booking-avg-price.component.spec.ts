import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardBookingAvgPriceComponent } from './forward-booking-avg-price.component';

describe('ForwardBookingAvgPriceComponent', () => {
  let component: ForwardBookingAvgPriceComponent;
  let fixture: ComponentFixture<ForwardBookingAvgPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwardBookingAvgPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardBookingAvgPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
