import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightTrackingComponent } from './freight-tracking.component';

describe('FreightTrackingComponent', () => {
  let component: FreightTrackingComponent;
  let fixture: ComponentFixture<FreightTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
