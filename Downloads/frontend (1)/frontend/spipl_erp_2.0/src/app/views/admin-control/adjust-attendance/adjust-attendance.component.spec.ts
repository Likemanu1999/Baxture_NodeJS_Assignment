import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustAttendanceComponent } from './adjust-attendance.component';

describe('AdjustAttendanceComponent', () => {
  let component: AdjustAttendanceComponent;
  let fixture: ComponentFixture<AdjustAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
