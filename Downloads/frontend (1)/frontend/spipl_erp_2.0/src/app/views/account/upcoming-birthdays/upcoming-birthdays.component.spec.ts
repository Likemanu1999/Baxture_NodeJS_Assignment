import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingBirthdaysComponent } from './upcoming-birthdays.component';

describe('UpcomingBirthdaysComponent', () => {
  let component: UpcomingBirthdaysComponent;
  let fixture: ComponentFixture<UpcomingBirthdaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpcomingBirthdaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingBirthdaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
