import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesActivityTrackingComponent } from './sales-activity-tracking.component';

describe('SalesActivityTrackingComponent', () => {
  let component: SalesActivityTrackingComponent;
  let fixture: ComponentFixture<SalesActivityTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesActivityTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesActivityTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
