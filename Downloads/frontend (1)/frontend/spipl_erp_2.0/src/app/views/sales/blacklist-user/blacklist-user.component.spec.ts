import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacklistUserComponent } from './blacklist-user.component';

describe('BlacklistUserComponent', () => {
  let component: BlacklistUserComponent;
  let fixture: ComponentFixture<BlacklistUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlacklistUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlacklistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
