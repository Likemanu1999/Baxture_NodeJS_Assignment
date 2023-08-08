import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardBookingChargesComponent } from './forward-booking-charges.component';

describe('ForwardBookingChargesComponent', () => {
  let component: ForwardBookingChargesComponent;
  let fixture: ComponentFixture<ForwardBookingChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwardBookingChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardBookingChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
