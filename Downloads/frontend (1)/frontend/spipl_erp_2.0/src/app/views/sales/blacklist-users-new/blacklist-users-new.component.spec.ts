import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacklistUsersNewComponent } from './blacklist-users-new.component';

describe('BlacklistUsersNewComponent', () => {
  let component: BlacklistUsersNewComponent;
  let fixture: ComponentFixture<BlacklistUsersNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlacklistUsersNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlacklistUsersNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
