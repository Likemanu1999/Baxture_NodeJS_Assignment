import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentLetterNewComponent } from './appointment-letter-new.component';

describe('AppointmentLetterNewComponent', () => {
  let component: AppointmentLetterNewComponent;
  let fixture: ComponentFixture<AppointmentLetterNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentLetterNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentLetterNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
