import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHolidayDateComponent } from './add-holiday-date.component';

describe('AddHolidayDateComponent', () => {
  let component: AddHolidayDateComponent;
  let fixture: ComponentFixture<AddHolidayDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHolidayDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHolidayDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
