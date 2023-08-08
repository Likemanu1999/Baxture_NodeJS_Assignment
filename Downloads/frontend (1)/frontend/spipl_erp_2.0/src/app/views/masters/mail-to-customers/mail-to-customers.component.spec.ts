import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailToCustomersComponent } from './mail-to-customers.component';

describe('MailToCustomersComponent', () => {
  let component: MailToCustomersComponent;
  let fixture: ComponentFixture<MailToCustomersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailToCustomersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailToCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
